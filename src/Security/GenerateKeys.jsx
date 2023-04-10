import { Button, message, Radio } from "antd";
import React, { useState } from "react";
import forge from "node-forge";
import { useAuthHeader, useAuthUser, useIsAuthenticated } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SERVER_PUBLIC = import.meta.env.VITE_SERVER_PUBLIC;

const GenerateKeys = (props) => {
  const [key, setKey] = useState([]);
  const [value, setValue] = useState(1);
  const nav = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const useAuth = useAuthHeader();
  const auth = useAuthUser();

  const onChange = (e) => {
    setValue(e.target.value);
  };

  // AES KEY
  const keyGen = async () => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    const url = "/api/keys/storeSym";

    let key, keyBase64;
    if (value === 1) {
      key = forge.random.getBytesSync(32);
      console.log("key");
      console.log(key);
      keyBase64 = forge.util.encode64(key);
    } else {
      // 3DES KEY
      key = forge.random.getBytesSync(24);
      keyBase64 = forge.util.encode64(key);
    }

    // encrypt with server public key
    let encodedEncrypt;
    try {
      const publicKeyObject = forge.pki.publicKeyFromPem(SERVER_PUBLIC);
      const encryptedBuffer = publicKeyObject.encrypt(keyBase64);
      console.log("encryBuffer");
      console.log(encryptedBuffer);
      encodedEncrypt = forge.util.encode64(encryptedBuffer);
      console.log("encodedEnc");
      console.log(encodedEncrypt);
    } catch {
      message.error("failed to encrypt Symmetric Key");
      return;
    }

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: useAuth(),
      },
      data: {
        encryptKey: encodedEncrypt,
        style: value,
        username: auth().username,
      },
      url: url,
    };

    const res = await axios(options)
      .then((response) => {
        if (response.status === 200) {
          message.success("Key Created and sent to Server via RSA");
        }
      })
      .catch((err) => {
        message.error("Failed to Send Key");
        console.log(err);
      });
  };
  return (
    <>
      <Radio.Group onChange={onChange} value={value}>
        <Radio value={1}> AES </Radio>
        <Radio value={2}> 3DES </Radio>
        <Button onClick={keyGen}> Generate Keys </Button>
      </Radio.Group>
    </>
  );
};

export default GenerateKeys;
