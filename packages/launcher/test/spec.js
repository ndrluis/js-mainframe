const assert = require('assert')
const path = require('path')
const os = require('os')
const Application = require('spectron').Application
const BzzAPI = require('@erebos/api-bzz-node').default

const getFixture = fixture => path.join(__dirname, '../../../fixtures', fixture)

describe('Application launch', function() {
  // mocha requires non arrow style function to bind context
  this.timeout(10000)

  before(function() {
    const binPath =
      os.platform() === 'darwin'
        ? 'dist/mac/Mainframe.app/Contents/MacOS/Mainframe'
        : 'dist/linux-unpacked/mainframe'
    this.app = new Application({
      path: path.join(__dirname, '..', binPath),
    })

    // To run the tests locally without having to build the binary, the following code can be used
    // this.app = new Application({
    //   path: path.join(__dirname, '../node_modules/.bin/electron-webpack'),
    //   args: ['dev'],
    // })

    return this.app.start()
  })

  after(function() {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('shows an initial window', async function() {
    const count = await this.app.client.getWindowCount()
    assert.equal(count, 1)
  })

  // Can be used when testing to save clearing state

  // it('opens the default vault', async function() {
  //   await this.app.client
  //     .element('[data-testid="vault-manager-unlock-input"]')
  //     .setValue('password')
  //   await this.app.client
  //     .element('[data-testid="vault-manager-unlock-button"]')
  //     .click()
  //   await this.app.client.waitForExist('[data-testid="launcher-view"]', 8000)
  // })

  it('creates a new vault', async function() {
    await this.app.client
      .element('[data-testid="create-vault-input-name"]')
      .setValue('test')
    await this.app.client
      .element('[data-testid="create-vault-input-password"]')
      .setValue('password')
    await this.app.client
      .element('[data-testid="create-vault-input-confirm-password"]')
      .setValue('password')
    await this.app.client
      .element('[data-testid="create-vault-button-submit"]')
      .click()
  })

  it('creates a new wallet', async function() {
    const createWalletButton = '[data-testid="create-wallet-button"]'
    await this.app.client.waitForExist(createWalletButton, 10000)
    await this.app.client.element(createWalletButton).click()

    const continueButton = '[data-testid="create-wallet-continue-button"]'
    await this.app.client.waitForExist(continueButton, 2000)
    await this.app.client.element(continueButton).click()
  })

  it('creates an app', async function() {
    const devButtonSelector = '[data-testid="launcher-toggle-dev-button"]'
    await this.app.client.waitForExist(devButtonSelector, 2000)
    await this.app.client.element(devButtonSelector).click()

    const createAppSelector = '[data-testid="launcher-create-app-button"]'
    await this.app.client.waitForExist(createAppSelector, 2000)
    await this.app.client.element(createAppSelector).click()

    const appNameInput = '[data-testid="create-app-name-input"]'
    await this.app.client.waitForExist(appNameInput, 2000)
    await this.app.client.element(appNameInput).setValue('test app')

    const versionInput = '[data-testid="create-app-version-input"]'
    await this.app.client.waitForExist(versionInput, 2000)
    await this.app.client.element(versionInput).setValue('1.0.0')

    //TODO: Issue choosing dir instead of file
    const appContents = getFixture('test-app/index.html')
    const contentsPathSelector = '#app-contents-file-selector'
    await this.app.client.waitForExist(contentsPathSelector, 2000)
    await this.app.client.chooseFile(contentsPathSelector, appContents)

    const step1Button = '[data-testid="create-app-set-info-button"]'
    await this.app.client.waitForExist(step1Button, 2000)
    await this.app.client.element(step1Button).click()

    const identityInputSelector = '[data-testid="create-identity-input-name"]'
    await this.app.client.waitForExist(identityInputSelector, 2000)
    await this.app.client.element(identityInputSelector).setValue('dev')

    const identityButtonSelector =
      '[data-testid="create-identity-button-submit"]'
    await this.app.client.waitForExist(identityButtonSelector, 2000)
    await this.app.client.element(identityButtonSelector).click()

    const identitySelector = '[data-testid="identity-selector-select-dev"]'
    await this.app.client.waitForExist(identitySelector, 2000)
    await this.app.client.element(identitySelector).click()

    const setPermissionsButton = '[data-testid="set-permission-requirements"]'
    await this.app.client.waitForExist(setPermissionsButton, 2000)
    await this.app.client.element(setPermissionsButton).click()

    const completeCreateAppBtn = '[data-testid="create-app-complete-button"]'
    await this.app.client.waitForExist(completeCreateAppBtn, 5000)
    await this.app.client.element(completeCreateAppBtn).click()

    const appItemSelector = '[data-testid="launcher-open-app"]'
    await this.app.client.waitForExist(appItemSelector, 5000)
    await this.app.client.element(appItemSelector).click()

    await this.app.client.waitForExist(identityInputSelector, 2000)
    await this.app.client.element(identityInputSelector).setValue('user')
    await this.app.client.element(identityButtonSelector).click()

    const userIdentity = '[data-testid="identity-selector-select-user"]'
    await this.app.client.waitForExist(userIdentity, 2000)
    await this.app.client.element(userIdentity).click()

    const count = await this.app.client.getWindowCount()
    assert.equal(count, 2)
  })

  it('completes app install flow and opens app', async function() {
    const devButtonSelector = '[data-testid="launcher-toggle-dev-button"]'
    await this.app.client.waitForExist(devButtonSelector, 2000)
    await this.app.client.element(devButtonSelector).click()

    await this.app.client
      .element('[data-testid="launcher-install-app-button"]')
      .click()

    // Ensure test app is uploaded to Swarm before trying to install it
    const bzz = new BzzAPI('http://swarm-gateways.net')
    await bzz.uploadDirectoryFrom(getFixture('test-app'))
    const manifestPath = getFixture('test-app-manifest.json')

    const fileInputSelector = '#installer-file-selector'
    await this.app.client.waitForExist(fileInputSelector, 2000)
    await this.app.client.chooseFile(fileInputSelector, manifestPath)

    const identityInputSelector = '[data-testid="create-identity-input-name"]'
    await this.app.client.waitForExist(identityInputSelector, 2000)
    await this.app.client.element(identityInputSelector).setValue('tester')

    const identityButtonSelector =
      '[data-testid="create-identity-button-submit"]'
    await this.app.client.waitForExist(identityButtonSelector, 2000)
    await this.app.client.element(identityButtonSelector).click()

    const identitySelector = '[data-testid="identity-selector-select-tester"]'
    await this.app.client.waitForExist(identitySelector, 2000)
    await this.app.client.element(identitySelector).click()

    const appItemSelector = '[data-testid="launcher-open-app"]'
    await this.app.client.waitForExist(appItemSelector, 5000)
    await this.app.client.element(appItemSelector).click()

    await this.app.client.waitForExist(identitySelector, 2000)
    await this.app.client.element(identitySelector).click()

    const count = await this.app.client.getWindowCount()
    assert.equal(count, 3)
  })
})
