import { describe, it, expect } from 'vitest';

describe('GET /verify', () => {
  it('should not exist', async () => {
    const res = await fetch('http://localhost:8080/verify');

    expect(await res.json()).toStrictEqual({
      error: {
        code: '404_not_found',
        reason: 'GET /verify',
      },
    });
  });
});

describe('POST /verify', () => {
  it('should enforce missing JSON', async () => {
    const res = await fetch('http://localhost:8080/verify', {
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
    const res = await fetch('http://localhost:8080/verify', {
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
    const res = await fetch('http://localhost:8080/verify', {
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

  it('should not verify JSON', async () => {
    const sign = await fetch('http://localhost:8080/sign', {
      method: 'POST',
      body: JSON.stringify({ foo: 'bar' }),
      headers: {
        'content-type': 'application/json',
      },
    });
    const signed = await sign.json();

    signed.signature = 'dkjfdkf';

    const res = await fetch('http://localhost:8080/verify', {
      method: 'POST',
      body: JSON.stringify(signed),
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(await res.json()).toStrictEqual({
      error: {
        code: '400_invalid_request',
        reason: "Signature doesn't match",
      },
    });
  });

  it('should verify JSON', async () => {
    const sign = await fetch('http://localhost:8080/sign', {
      method: 'POST',
      body: JSON.stringify({ foo: 'bar' }),
      headers: {
        'content-type': 'application/json',
      },
    });
    expect(sign.status).toBe(200);
    const signed = await sign.json();

    const res = await fetch('http://localhost:8080/verify', {
      method: 'POST',
      body: JSON.stringify(signed),
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(res.status).toBe(204);
  });

  it('should verify encrypted JSON', async () => {
    const encrypt = await fetch('http://localhost:8080/encrypt', {
      method: 'POST',
      body: JSON.stringify({ foo: 'bar' }),
      headers: {
        'content-type': 'application/json',
      },
    });
    expect(encrypt.status).toBe(200);
    const encrypted = await encrypt.json();

    const sign = await fetch('http://localhost:8080/sign', {
      method: 'POST',
      body: JSON.stringify(encrypted),
      headers: {
        'content-type': 'application/json',
      },
    });
    expect(sign.status).toBe(200);
    const signed = await sign.json();

    const res = await fetch('http://localhost:8080/verify', {
      method: 'POST',
      body: JSON.stringify(signed),
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(res.status).toBe(204);
  });
});
