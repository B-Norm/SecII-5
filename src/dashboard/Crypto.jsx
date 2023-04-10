import React, { useEffect, useState } from "react";
import { Button, Cascader, message, Radio } from "antd";
import { useAuthHeader, useAuthUser, useIsAuthenticated } from "react-auth-kit";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RSADecrypt from "../Security/RSADecrypt";
import RSAEncrypt from "../Security/RSAEncrypt";
import CheckHash from "../Security/CheckHash";
import AESEncryption from "../Security/AESEncryption";
import DESEncryption from "../Security/3DESEncryption";

const Crypto = (props) => {
  const [value, setValue] = useState(1);
  const isAuthenticated = useIsAuthenticated();
  const nav = useNavigate();
  const useAuth = useAuthHeader();
  const auth = useAuthUser();
  // TODO: Implement RSA Decrypt and other encryption
  const encryptStyles = ["AES", "3DES", "RSA", "HASH"];

  const onChange = (e) => {
    setValue(e.target.value);
  };

  //useEffect(() => {}, []);

  return (
    <>
      <Radio.Group onChange={onChange} value={value}>
        <Radio value={1}>AES</Radio>
        <Radio value={2}>3DES</Radio>
        <Radio value={3} /* onChange={() => getPublicKeys()} */>RSA</Radio>
        <Radio disabled={props.file.encrypted} value={4}>
          Check Hash
        </Radio>
      </Radio.Group>
      {value === 1 && (
        <AESEncryption
          file={props.file}
          setSelectedCard={props.setSelectedCard}
        />
      )}
      {value === 2 && (
        <DESEncryption
          file={props.file}
          setSelectedCard={props.setSelectedCard}
        />
      )}
      {value === 3 &&
        (props.file.encrypted ? (
          <RSADecrypt
            file={props.file}
            setSelectedCard={props.setSelectedCard}
          />
        ) : (
          <RSAEncrypt
            file={props.file}
            setSelectedCard={props.setSelectedCard}
          />
        ))}
      {value === 4 && (
        <>
          <CheckHash file={props.file} />
        </>
      )}
    </>
  );
};

export default Crypto;
