const fs = require('fs')
const path = require('path')
const uploadConfig = require('../configs/upload')
const AppError = require('../utils/AppError')

class DiskStorage {
  async saveAvatarFile(file) {
    await fs.promises.rename(
      path.resolve(uploadConfig.TMP_FOLDER, file),
      path.resolve(uploadConfig.UPLOADS_FOLDER, file)
    )

    return file
  }

  async saveFile(filePath, destinationPath, newPath) {
    const fileUploadFolder = path.resolve(
      uploadConfig.UPLOADS_FOLDER,
      destinationPath
    )

    const fileTMPFolder = path.resolve(uploadConfig.TMP_FOLDER,filePath)

    try {
      await fs.promises.rename(fileTMPFolder, fileUploadFolder)
    } catch (err) {
      console.error('Erro ao renomear arquivo:', err)
      throw err // Rejeita a promessa com o erro
    }
    // await fs.promises.copyFile(filePath, newFilePath)

    return newPath
  }

  async deleteFile(file) {
    const filePath = path.resolve(uploadConfig.UPLOADS_FOLDER, file)

    try {
      await fs.promises.stat(filePath)
    } catch {
      return
    }
    await fs.promises.unlink(filePath)
  }

  async updateFile(filePath, destinationPath, newPath) {
    if (!newPath) {
      throw new AppError('O novo caminho do arquivo é obrigatório')
    }

    const fileUploadFolder = path.resolve(
      uploadConfig.UPLOADS_FOLDER,
      destinationPath
    )

    const fileTMPFolder = path.resolve(uploadConfig.TMP_FOLDER,filePath)

    try {
      await fs.promises.rename(fileTMPFolder, fileUploadFolder)
    } catch (err) {
      console.error('Erro ao renomear arquivo:', err)
      throw err // Rejeita a promessa com o erro
    }

    return newPath
  }
}

module.exports = DiskStorage
