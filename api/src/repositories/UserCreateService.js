const { hash } = require('bcryptjs')
const AppError = require('../utils/AppError.js')

class UserCreateService {
  constructor(userRepository){
    this.userRepository = userRepository
  }

  async execute({ name, username, password, role, unit}){
    const chekUserExists = await this.userRepository.findByUsername(username)

    if(chekUserExists) {
      throw new AppError('Usuário já cadastrado')
    }

    const hashedPassword = await hash(password, 8)
    const userCreated = await this.userRepository.create({name, username, password: hashedPassword, role, unit})

    return userCreated
  }
}

module.exports = UserCreateService
