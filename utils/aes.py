import os

from Crypto.Cipher import AES

key = bytes(os.getenv("AES_KEY").encode())


def decrypt(ciphertext: bytes, tag: bytes, nonce: bytes):
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    return cipher.decrypt_and_verify(ciphertext, tag)


def encrypt(plaintext: str | bytes) -> tuple[bytes, bytes, bytes]:
    # return bytes(plaintext.encode())
    if not isinstance(plaintext, bytes):
        plaintext = bytes(plaintext.encode())

    cipher = AES.new(key, AES.MODE_GCM)

    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    return ciphertext, tag, cipher.nonce
