import React, { useEffect, useState } from "react";
import { Button, Cascader, message, Radio } from "antd";
import { useAuthHeader, useAuthUser, useIsAuthenticated } from "react-auth-kit";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RSADecrypt from "../Security/RSADecrypt";
import RSAEncrypt from "../Security/RSAEncrypt";

const Crypto = (props) => {
  const [value, setValue] = useState(1);
  const isAuthenticated = useIsAuthenticated();
  const nav = useNavigate();
  const useAuth = useAuthHeader();
  const auth = useAuthUser();
  // TODO: Implement RSA Decrypt and other encryption
  const encryptStyles = ["AES", "3DES", "RSA", "HASH"];

  const onChange = (e) => {
    console.log("radio checked", e.target.value);
    setValue(e.target.value);
  };

  // Key retreival

  // Style guide: 1=AES, 2=DES, 3=RSA, 4=HASH

  //useEffect(() => {}, []);

  return (
    <>
      <Radio.Group onChange={onChange} value={value}>
        <Radio value={1}>AES</Radio>
        <Radio value={2}>3DES</Radio>
        <Radio value={3} /* onChange={() => getPublicKeys()} */>RSA</Radio>
        <Radio value={4}>Check Hash</Radio>
      </Radio.Group>
      {value === 1 && (
        <>
          <p>Choose Key</p>
          {/* <Cascader
            fieldNames={{
              label: "username",
              value: "username",
            }}
            options={keys}
            onChange={() => {}}
          />

          <Button onClick={() => encryptFile(value)}>Submit</Button> */}
        </>
      )}
      {value === 2 && (
        <>
          <p>Choose Key</p>
          <Button>Submit</Button>
        </>
      )}
      {value === 3 &&
        (!props.file.encrypted ? (
          <RSAEncrypt
            file={props.file}
            setSelectedCard={props.setSelectedCard}
          />
        ) : (
          <RSADecrypt
            file={props.file}
            setSelectedCard={props.setSelectedCard}
          />
        ))}
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
