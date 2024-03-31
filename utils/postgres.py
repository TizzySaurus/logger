import os
from logging import Logger

import asyncpg


class PostgresConnection:
    def __init__(self, logger: Logger):
        self.logger = logger

    async def _create_pool(self):
        pg_dbname = os.getenv("PG_DATABASE").lower()
        pg_host = os.getenv("PG_HOST")
        pg_passw = os.getenv("PG_PASSW")
        pg_user = os.getenv("PG_USER")

        database_existed = True

        async with asyncpg.create_pool(
            database="postgres",  # should exist by default
            host=pg_host,
            password=pg_passw,
            user=pg_user,
        ) as pool:
            result = await self.execute_sql(
                f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{pg_dbname}'", pool=pool
            )
            if result is None:
                # Database doesn't exist, so create it
                database_existed = False
                self.logger.warn(
                    f"The configured postgres database ({pg_dbname}) doesn't exist. Proceeding to create it and add tables..."
                )
                await self.execute_sql(f"CREATE DATABASE {pg_dbname}", pool=pool, use_transaction=False)

        self.pool = await asyncpg.create_pool(
            database=pg_dbname,
            host=pg_host,
            password=pg_passw,
            user=pg_user,
        )

        if not database_existed:
            # NB: Using BIGINT for discord ids will work upto 2084-09-06T15:47:35.551Z
            await self.execute_sql(
                "CREATE TABLE messages ( "
                "id BIGINT PRIMARY KEY, "
                "author_id BIGINT NOT NULL, "
                "content TEXT, "
                "attachment_b64 TEXT, "
                "ts TIMESTAMPTZ "
                ")"
            )
            await self.execute_sql(
                "CREATE TABLE guilds ( "
                "id BIGINT PRIMARY KEY, "
                "owner_id BIGINT NOT NULL, "
                "ignored_channels BIGINT[], "
                "disabled_events TEXT[], "
                "event_logs JSON, "
                "log_bots BOOL, "
                "custom_settings JSON "
                ")"
            )
            self.logger.info(f"Successfully created and added tables to the {pg_dbname} database.")

    async def _execute_sql_select(self, query: str, *params, index: int, return_all: bool, pool: asyncpg.Pool):
        async with pool.acquire() as connection:
            connection: asyncpg.Connection

            if return_all:
                query_result = await connection.fetch(query, *params)

                if index is None:
                    return query_result
                return [record[index] for record in query_result]

            if index is None:
                return await connection.fetchrow(query, *params)
            return await connection.fetchval(query, *params, column=index)

    async def _execute_sql_ddl(self, query: str, *params, pool: asyncpg.Pool, use_transaction: bool):
        async with pool.acquire() as connection:
            connection: asyncpg.Connection

            if use_transaction:
                is_many = len(params) > 0 and isinstance(params[0], (list, tuple))
                async with connection.transaction():
                    if is_many:
                        return await connection.executemany(query, *params)
                    return await connection.execute(query, *params)
            else:
                return await connection.execute(query, *params)

    async def execute_sql(
        self,
        query: str,
        *params,
        index: int | None = None,
        return_all=False,
        pool: asyncpg.Pool | None = None,
        use_transaction: bool = True,
    ):
        pool = pool or self.pool

        if query.upper().startswith("SELECT"):
            return await self._execute_sql_select(query, *params, index=index, return_all=return_all, pool=pool)
        return await self._execute_sql_ddl(query, *params, pool=pool, use_transaction=use_transaction)


async def create_postgres_connection(logger: Logger):
    connection = PostgresConnection(logger)
    await connection._create_pool()

    return connection
