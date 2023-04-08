import React, { useEffect, useState } from "react";
import { Button, Cascader, message, Radio } from "antd";
import { useAuthHeader, useIsAuthenticated } from "react-auth-kit";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Crypto = (props) => {
  const [value, setValue] = useState(1);
  const [keys, setKeys] = useState([]);
  const [rsaKey, setrsaKey] = useState("");
  const isAuthenticated = useIsAuthenticated();
  const nav = useNavigate();
  let key;
  const useAuth = useAuthHeader();

  const encryptStyles = ["AES", "3DES", "RSA", "HASH"];

  const onChange = (e) => {
    console.log("radio checked", e.target.value);
    setValue(e.target.value);
  };

  const updateRSAKey = (value) => {
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].username == value) {
        key = keys[i].publicKey;
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
          console.log(response.data);
          setKeys(response.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Style guide: 1=AES, 2=DES, 3=RSA, 4=HASH
  const encryptFile = async (style) => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    let url = "/api/encrypt";
    const encryptStyle = style;

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: useAuth(),
      },
      data: {
        encryptStyle: encryptStyle,
        key: key,
        fileID: props.file._id,
      },
      url: url,
    };
    const res = await axios(options)
      .then((response) => {
        if (response.status === 200) {
          message.success("File Encrypted by " + encryptStyles[style - 1]);
          props.getFiles();
          props.setSelectedCard(null);
        }
      })
      .catch((err) => {
        message.error("Failed to Encrypt");
        console.log(err);
      });
  };
  //useEffect(() => {}, []);

  return (
    <>
      <Radio.Group onChange={onChange} value={value}>
        <Radio value={1}>AES</Radio>
        <Radio value={2}>3DES</Radio>
        <Radio value={3} onChange={() => getPublicKeys()}>
          RSA
        </Radio>
        <Radio value={4}>Check Hash</Radio>
      </Radio.Group>
      {value === 1 && (
        <>
          <p>Choose Key</p>
          <Button>Submit</Button>
        </>
      )}
      {value === 2 && (
        <>
          <p>Choose Key</p>
          <Button>Submit</Button>
        </>
      )}
      {value === 3 && (
        <>
          <p>Choose User's Public Key</p>
          <Cascader
            fieldNames={{
              label: "username",
              value: "username",
            }}
            options={keys}
            onChange={updateRSAKey}
          />

          <Button onClick={() => encryptFile(value)}>Submit</Button>
        </>
      )}
      {value === 4 && (
        <>
          <p>Test Hash</p>
          <Button>Submit</Button>
        </>
      )}
    </>
  );
};

export default Crypto;
