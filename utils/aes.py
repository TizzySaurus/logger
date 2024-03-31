import os

from Crypto.Cipher import AES

key = bytes(os.getenv("AES_KEY").encode())


def decrypt(ciphertext: bytes, tag: bytes):
    cipher = AES.new(key, AES.MODE_EAX)
    return cipher.decrypt(ciphertext, tag)


def encrypt(plaintext: str):
    return bytes(plaintext.encode())

    # cipher = AES.new(key, AES.MODE_EAX)
    # print("Encrypting...")
    # # BUG: For some reason this hangs seemingly infinitely
    # encrypted = cipher.encrypt(plaintext)
    # print("Encrypted, so returning")
    # return encrypted
