import { gql, useMutation } from '@apollo/client';
import { useEffect } from 'react';

export const Root = () => {
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
  return <>{data?.token}</>;
};
