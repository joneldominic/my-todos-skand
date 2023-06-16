import React, { useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';

function Root() {
  // to log in, get a json web token
  // this account has been seeded to the database in advance
  const [getToken, { data }] = useMutation(gql`
    mutation Token {
      token(email: "test@skand.io", password: "testtest")
    }
  `);

  useEffect(() => {
    getToken();
  }, [getToken]);

  // simply show the token for now
  return <h1>{data?.token}</h1>;
}

export default Root;
