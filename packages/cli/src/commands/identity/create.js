// @flow

import type Client from '@mainframe/client'
import { prompt } from 'inquirer'

import Command from '../../OpenVaultCommand'

export default class IdentityCreateCommand extends Command {
  static description = 'Create identitiy'
  static flags = Command.flags

  async run() {
    if (this.client == null) {
      return
    }
    const command = await promptSelectCommand()
    const res = await identityCreateCommands[command](this, this.client)
    this.log(res)
  }
}

export const promptCreateDeveloper = async () => {
  const answers = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Developer name:',
    },
  ])

  if (answers.name.length === 0) {
    throw new Error('Name must be provided')
  }

  return {
    name: answers.name,
  }
}

export const promptCreateUser = async () => {
  const answers = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Name of user:',
    },
  ])

  if (answers.name.length === 0) {
    throw new Error('Name must be provided')
  }

  return {
    name: answers.name,
  }
}

export const createDeveloperIdentity = async (
  cmd: Command,
  client: Client,
): Promise<string> => {
  let data
  while (data == null) {
    try {
      data = await promptCreateDeveloper()
    } catch (err) {
      cmd.warn(err)
    }
  }

  const res = await client.identity.createDeveloper({ data })
  client.close()
  return `Created developer identity: ${res.id}`
}

export const createUserIdentity = async (
  cmd: Command,
  client: Client,
): Promise<string> => {
  let data
  while (data == null) {
    try {
      data = await promptCreateUser()
    } catch (err) {
      cmd.warn(err)
    }
  }

  const res = await client.identity.createUser({ data })
  client.close()
  return `Created user identity: ${res.id}`
}

const identityCreateCommands = {
  Developer: createDeveloperIdentity,
  User: createUserIdentity,
}

const promptSelectCommand = async () => {
  const answers = await prompt([
    {
      type: 'list',
      name: 'command',
      message: 'Select identity type:',
      choices: Object.keys(identityCreateCommands),
    },
  ])
  return answers.command
}
