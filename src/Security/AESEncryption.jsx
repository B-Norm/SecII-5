import React, { useEffect, useState } from "react";
import { Button, Cascader, message, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthHeader, useAuthUser, useIsAuthenticated } from "react-auth-kit";
import forge from "node-forge";
import PEMUpload from "./PEMUpload";
import {
  asymEncrypt,
  asymDecrypt,
  aesEncrypt,
  aesDecrypt,
  aesDecryptFromRand,
} from "./SecHelper";

const AESEncryption = (props) => {
  const [keys, setKeys] = useState([]);
  const [symKey, setSymKey] = useState(null);
  const [pemString, setPemString] = useState("");
  const nav = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const useAuth = useAuthHeader();
  const auth = useAuthUser();
  const AES = 1;

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
        style: AES,
        username: auth().username,
      },
      url: url,
    };

    const res = await axios(options)
      .then((response) => {
        if (response.status === 200) {
          // decrypt with private key and then decrpyt cypher with sent key load keys
          try {
            const aesKey = asymDecrypt(
              forge.util.encode64(response.data.encryptedKey),
              pemString,
              "buffer"
            );

            let decryptedData = aesDecryptFromRand(
              response.data.encryptedData,
              aesKey
            );
            setKeys(JSON.parse(decryptedData.toString()));
          } catch (err) {
            message.error("Failed to receive keys from Server.");
            console.error(err);
            setPemString("");
          }
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
    let url = "/api/AES/encrypt";

    // Encrypt data with AES and send it with the IV at the front
    const byteBuffer = forge.util.createBuffer();
    props.file.file.data.data.forEach((byte) => {
      byteBuffer.putByte(byte);
    });
    const encryptedData = aesEncrypt(byteBuffer, symKey);

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: useAuth(),
      },
      data: {
        iv: encryptedData.encodedIV,
        file: encryptedData.encryptedData64,
        fileID: props.file._id,
      },
      url: url,
    };

    const res = await axios(options)
      .then((response) => {
        if (response.status === 200) {
          message.success("File Encrypted by with AES");
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
    let url = "/api/AES/decrypt";

    const byteBuffer = forge.util.createBuffer();
    props.file.file.data.data.forEach((byte) => {
      byteBuffer.putByte(byte);
    });

    const decryptedData = aesDecrypt(byteBuffer, props.file.iv, symKey);
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
            message.success("File Decrypted with AES");
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
    if (pemString != "") {
      getSymKeys();
    }
  }, [pemString]);

  return (
    <>
      {pemString != "" ? (
        <div>
          <p>Choose AES Key</p>
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
            <Button onClick={() => decryptFile(2)}>
              Download Decrypted File
            </Button>
          )}
        </div>
      ) : (
        <PEMUpload setPemString={setPemString} />
      )}
    </>
  );
};

export default AESEncryption;
