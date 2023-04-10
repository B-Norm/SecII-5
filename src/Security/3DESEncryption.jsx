import React, { useEffect, useState } from "react";
import { Button, Cascader, message, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthHeader, useAuthUser, useIsAuthenticated } from "react-auth-kit";
import forge from "node-forge";
const { Dragger } = Upload;
const SERVER_AES_KEY = import.meta.env.VITE_SERVER_AES_KEY;

const DESEncryption = (props) => {
  const [keys, setKeys] = useState([]);
  const [symKey, setSymKey] = useState(null);
  const nav = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const useAuth = useAuthHeader();
  const auth = useAuthUser();
  const DES = 2;

  const updateSymKey = (value) => {
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].keyName == value) {
        setSymKey(keys[i].symKey);
        break;
      }
    }
  };

  // tries to decrypt user's keys sent to server
  // and stores them in setSymKey
  const getSymKeys = async () => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    let url = "/api/keys/getSym";

    let options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: useAuth(),
      },
      data: {
        style: DES,
        username: auth().username,
      },
      url: url,
    };

    const res = await axios(options)
      .then((response) => {
        if (response.status === 200) {
          // decrypt with server key and load keys
          const iv = forge.util.decode64(
            response.data.encryptedData.slice(0, 24)
          );
          const encrypted = forge.util.decode64(
            response.data.encryptedData.slice(24)
          );

          const aesKeyBytes = forge.util.decode64(SERVER_AES_KEY);
          const decipher = forge.cipher.createDecipher("AES-CBC", aesKeyBytes);
          decipher.start({ iv });
          decipher.update(forge.util.createBuffer(encrypted));
          decipher.finish();

          const decryptedData = JSON.parse(decipher.output.toString());
          setKeys(decryptedData);
        }
      })
      .catch((err) => {
        message.error("Failed to load Keys");
        console.log(err);
      });
  };

  const encryptFile = async () => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    let url = "/api/3DES/encrypt";

    // Encrypt data with 3DES and send it with the IV at the front
    const byteBuffer = forge.util.createBuffer();
    props.file.file.data.data.forEach((byte) => {
      byteBuffer.putByte(byte);
    });

    const iv = forge.random.getBytesSync(8);
    console.log(symKey);
    const DESKeyBytes = forge.util.decode64(symKey);
    console.log("DES BYTES:", DESKeyBytes.length);
    const cipher = forge.cipher.createCipher("3DES-CBC", DESKeyBytes);
    cipher.start({ iv: iv });
    cipher.update(byteBuffer);
    cipher.finish();

    const encryptedData = forge.util.encode64(cipher.output.getBytes());
    const encodedIV = forge.util.encode64(iv);

    console.log(encodedIV);
    console.log(encryptedData);

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: useAuth(),
      },
      data: {
        iv: encodedIV,
        file: encryptedData,
        fileID: props.file._id,
      },
      url: url,
    };

    const res = await axios(options)
      .then((response) => {
        if (response.status === 200) {
          message.success("File Encrypted by with 3DES");
          props.setSelectedCard(null);
        }
      })
      .catch((err) => {
        message.error("Failed to Encrypt");
        console.log(err);
      });
  };

  const decryptFile = async (value) => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    let url = "/api/3DES/decrypt";

    const byteBuffer = forge.util.createBuffer();
    props.file.file.data.data.forEach((byte) => {
      byteBuffer.putByte(byte);
    });
    const iv = forge.util.decode64(props.file.iv);
    const DESKeyBytes = forge.util.decode64(symKey);

    const decipher = forge.cipher.createDecipher("3DES-CBC", DESKeyBytes);
    decipher.start({ iv });
    decipher.update(forge.util.createBuffer(byteBuffer));
    decipher.finish();

    const decryptedData = forge.util.encode64(decipher.output.getBytes());

    // update database with decrypted file
    if (value === 1) {
      const options = {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: useAuth(),
        },
        data: {
          file: decryptedData,
          fileID: props.file._id,
        },
        url: url,
      };

      const res = await axios(options)
        .then((response) => {
          if (response.status === 200) {
            message.success("File Decrypted with 3DES");
            props.setSelectedCard(null);
          }
        })
        .catch((err) => {
          message.error("Wrong Key used");
          props.setSelectedCard();
          console.log(err);
        });
    } else {
      // Download Decrypted file
      const url =
        "data:" + props.file.file.contentType + ";base64," + decryptedData;

      event.preventDefault();
      const link = document.createElement("a");
      link.href = url;
      link.download = props.file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    getSymKeys();
  }, []);

  return (
    <>
      <p>Choose DES Key</p>
      <Cascader
        fieldNames={{
          label: "keyName",
          value: "keyName",
        }}
        options={keys}
        onChange={updateSymKey}
      />

      <Button
        onClick={() => {
          if (props.file.encrypted) {
            decryptFile(1);
          } else {
            encryptFile();
          }
        }}
      >
        Submit
      </Button>
      {props.file.encrypted && (
        <Button onClick={() => decryptFile(2)}>Download Decrypted File</Button>
      )}
    </>
  );
};

export default DESEncryption;
