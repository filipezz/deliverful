module.exports = {
  '*.ts': (files) => {
    const filesBatch = files.map(filePath => {
      return filePath.replace(/.[^\s]+functions/g, '/usr/src/app/functions');
    }).join(' ');
    const testStagedCmd = `firebase emulators:exec --only firestore "npm run test:staged -- ${filesBatch}"`

    return [
      `docker exec deliverful-server npm run lint ${filesBatch}`,
      `docker exec deliverful-server ${testStagedCmd}`
    ]
  }
}