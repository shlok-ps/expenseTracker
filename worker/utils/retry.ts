async function retry<T>(fn: () => T, retries = 3, delay = 500) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      await new Promise(res => setTimeout(res, delay)); // optional backoff
    }
  }
}
