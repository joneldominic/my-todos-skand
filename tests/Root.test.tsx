import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import Root from '../src/Root';

describe('Root Component', () => {
  let mocks;

  beforeEach(() => {
    mocks = [
      {
        request: {
          query: gql`
            mutation Token {
              token(email: "test@skand.io", password: "testtest")
            }
          `
        },
        result: {
          data: { token: 'dummy-token' }
        }
      }
    ];
  });

  describe('Rendering', () => {
    it('should renders token when data is available', async () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <Root />
        </MockedProvider>
      );

      const token = await screen.findByText('dummy-token');
      expect(token).toBeInTheDocument();
    });

    it('should render a button with the text "CONTAINED"', () => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <Root />
        </MockedProvider>
      );

      const button = screen.getByText(/CONTAINED/i);
      expect(button).toBeInTheDocument();
    });
  });
});
