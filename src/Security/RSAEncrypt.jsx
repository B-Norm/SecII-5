import React, { useEffect, useState } from "react";
import { Button, Cascader, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthHeader, useAuthUser, useIsAuthenticated } from "react-auth-kit";
import forge from "node-forge";

const RSAEncrypt = (props) => {
  const [keys, setKeys] = useState([]);
  const [pubRSAKey, setPubRSAKey] = useState(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const nav = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const useAuth = useAuthHeader();
  const auth = useAuthUser();

  const updatePubRSAKey = (value) => {
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].username == value) {
        setPubRSAKey(keys[i].publicKey);
        break;
      }
    }
  };

  const getPublicKeys = async () => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    let url = "/api/keys/getAllPublic";
    let options = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        authorization: useAuth(),
      },
      url: url,
    };
    const res = await axios(options)
      .then((response) => {
        if (response.status === 200) {
          //console.log(response.data);
          setKeys(response.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // use pubKey to encrypt props.file.data and send it to the server to
  // save under the props.file._id
  const encryptFile = async () => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    let url = "/api/RSA/encrypt";

    const buffer = btoa(
      String.fromCharCode(...new Uint8Array(props.file.file.data.data))
    );

    // Parse the public key string into a Forge public key object
    const publicKeyObject = forge.pki.publicKeyFromPem(pubRSAKey);

    // Encrypt the input buffer using the public key
    const encryptedBuffer = publicKeyObject.encrypt(buffer);
    const encodedEncrypt = forge.util.encode64(encryptedBuffer);
    console.log(encodedEncrypt);
    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: useAuth(),
      },
      data: {
        file: encodedEncrypt,
        fileID: props.file._id,
      },
      url: url,
    };

    const res = await axios(options)
      .then((response) => {
        if (response.status === 200) {
          message.success("File Encrypted by with RSA");
          props.setSelectedCard(null);
        }
      })
      .catch((err) => {
        message.error("Failed to Encrypt");
        console.log(err);
      });
  };

  useEffect(() => {
    getPublicKeys();
  }, []);
  return (
    <>
      <p>Choose User's Public Key</p>
      <Cascader
        fieldNames={{
          label: "username",
          value: "username",
        }}
        options={keys}
        onChange={updatePubRSAKey}
      />

      <Button onClick={() => encryptFile()}>Submit</Button>
    </>
  );
};

export default RSAEncrypt;
