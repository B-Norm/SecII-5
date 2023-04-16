import { Button, Modal, Cascader, message } from "antd";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthHeader, useAuthUser, useIsAuthenticated } from "react-auth-kit";
import forge from "node-forge";
import PEMUpload from "./PEMUpload";
import { asymDecrypt, aesDecryptFromRand, asymEncrypt } from "./SecHelper";
const SERVER_PUBLIC = import.meta.env.VITE_SERVER_PUBLIC;

const ShareKey = () => {
  const [display, setDisplay] = useState(false);
  const [nextChoice, setNextChoice] = useState(false);
  const [pemString, setPemString] = useState("");
  const [keys, setKeys] = useState([]);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [symKey, setSymKey] = useState(null);

  const nav = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const useAuth = useAuthHeader();
  const auth = useAuthUser();
  const ALL = 3;

  const handleOpenDisplay = () => {
    setDisplay(true);
  };
  const handleCancelDisplay = () => {
    setPemString("");
    setSymKey(null);
    setUser(null);
    setNextChoice(false);
    setDisplay(null);
  };

  const updateSymKey = (value) => {
    //console.log(keys);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].keyName == value) {
        console.log(keys[i]);
        setSymKey(keys[i]);
        setNextChoice(true);
        break;
      }
    }
  };

  const updateUsers = (value) => {
    for (let i = 0; i < users.length; i++) {
      if (users[i].username == value) {
        setUser(users[i].username);
        break;
      }
    }
  };

  const shareKey = async () => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    const url = "/api/keys/shareSymKey";

    // encrypt key with server's public key
    const encryptKey = asymEncrypt(
      forge.util.encode64(symKey.symKey),
      auth().SERVER_PUBLIC_KEY
    );

    let options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: useAuth(),
      },
      data: {
        encryptKey: encryptKey,
        keyName: symKey.keyName,
        username: user,
      },
      url: url,
    };

    await axios(options)
      .then((res) => {
        if (res === 200) {
          message.success("Key Shared to " + user + ".");
          handleCancelDisplay();
        }
      })
      .catch((err) => {
        message.error("Key Failed to Share.");
        console.error(err);
      });
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
        style: ALL,
        username: auth().username,
      },
      url: url,
    };

    const res = await axios(options)
      .then((response) => {
        if (response.status === 200) {
          // decrypt with private key and then decrpyt cypher with sent key load keys
          console.log("res data key: ", response.data.encryptedKey);
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
            setPemString("");
          }
        }
      })
      .catch((err) => {
        message.error("Failed to load Keys");
        console.log(err);
      });
  };

  const getUsers = async () => {
    if (!isAuthenticated()) {
      nav("/login");
    }
    let url = "/api/getUsers";

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
          // decrypt with private key and then decrpyt cypher with sent key load keys
          setUsers(response.data);

          /* let decryptedData = aesDecryptFromRand(
            response.data.encryptedData,
            aesKey 
          );   

          setKeys(JSON.parse(decryptedData.toString())); */
        }
      })
      .catch((err) => {
        message.error("Failed to load users");
        console.log(err);
      });
  };

  useEffect(() => {
    if (pemString != "") {
      getSymKeys();
      getUsers();
    }
  }, [pemString]);

  return (
    <>
      <Button onClick={handleOpenDisplay}> Share Key </Button>
      <Modal
        title="Share Keys"
        open={display}
        destroyOnClose={true}
        onCancel={handleCancelDisplay}
        footer={[]}
      >
        {pemString != "" ? (
          <div>
            <p>Choose Symmetric Key to Share</p>
            <Cascader
              fieldNames={{
                label: "keyName",
                value: "keyName",
              }}
              options={keys}
              onChange={updateSymKey}
            />
          </div>
        ) : (
          <PEMUpload setPemString={setPemString} />
        )}

        {nextChoice != "" && (
          <div>
            <p>Choose User to Share</p>
            <Cascader
              fieldNames={{
                label: "username",
                value: "username",
              }}
              options={users}
              onChange={updateUsers}
            />
            <Button
              onClick={() => {
                if (user && symKey) {
                  shareKey();
                } else {
                  message.error("Select a Key and User");
                }
              }}
            >
              Share Key
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ShareKey;
