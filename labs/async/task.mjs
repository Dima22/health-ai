export function task(name, ms, shouldFail = false) {
  console.log(`START ${name}`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        console.log(`FAIL ${name}`);
        reject(new Error(`Task ${name} failed`));
        return;
      }

      console.log(`END ${name}`);
      resolve(`Result ${name}`);
    }, ms);
  });
}