import { describe, it, expect } from 'vitest';

describe('GET /decrypt', () => {
  it('should not exist', async () => {
    const res = await fetch('http://localhost:8080/decrypt');

    expect(await res.json()).toStrictEqual({
      error: {
        code: '404_not_found',
        reason: 'GET /decrypt',
      },
    });
  });
});

describe('POST /decrypt', () => {
  it('should enforce missing JSON', async () => {
    const res = await fetch('http://localhost:8080/decrypt', {
      method: 'POST',
    });

    expect(await res.json()).toStrictEqual({
      error: {
        code: '400_invalid_request',
        reason: 'Provide a valid JSON',
      },
    });
  });

  it('should not allow bad content/type', async () => {
    const res = await fetch('http://localhost:8080/decrypt', {
      method: 'POST',
      body: 'foobar',
    });

    expect(await res.json()).toStrictEqual({
      error: {
        code: '500_server_error', // Could be handled better
      },
    });
  });

  it('should not allow bad JSON', async () => {
    const res = await fetch('http://localhost:8080/decrypt', {
      method: 'POST',
      body: 'foobar',
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(await res.json()).toStrictEqual({
      error: {
        code: '400_invalid_request',
        reason: 'Please provide a valid payload',
      },
    });
  });

  it('should handle not encrypted JSON', async () => {
    const res = await fetch('http://localhost:8080/decrypt', {
      method: 'POST',
      body: '{"foo":"bar"}',
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(await res.json()).toStrictEqual({
      error: {
        code: '400_invalid_request',
        reason: 'Please provide an encrypted JSON',
      },
    });
  });

  it('should decrypt JSON', async () => {
    const encrypt = await fetch('http://localhost:8080/encrypt', {
      method: 'POST',
      body: '{"foo":"bar"}',
      headers: {
        'content-type': 'application/json',
      },
    });
    const encrypted = await encrypt.json();

    const res = await fetch('http://localhost:8080/decrypt', {
      method: 'POST',
      body: JSON.stringify(encrypted),
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(await res.json()).toStrictEqual({
      foo: 'bar',
    });
  });
});
