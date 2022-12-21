// https://www.npmjs.com/package/@nuxt/test-utils
// https://github.com/nuxt/framework/tree/c53c7360b78611e4efcd86c426f552cf3d6eabec/packages/test-utils
// https://test-utils.nuxtjs.org/api-reference/setup
// https://github.com/nuxt/framework/blob/8f81644b20079a47bef1951f11368a099224b466/examples/advanced/testing/app.vue

import { describe, expect, it } from 'vitest'
//import { describe, test } from 'vitest'
//import { $fetch, isDev, setup  } from '@nuxt/test-utils'
import { createPage, setup  } from '@nuxt/test-utils'


console.log("test1 AAA")

describe('example', () => {

  console.log("test1 BBB")
  setup({
    testDir: '~~/tests',
    browser: true
  })
  console.log("test1 CCC")
  //it('Renders Hello Nuxt', async () => {
  //  expect(await $fetch('/')).toMatch('Hello Nuxt!')
  //})
  /*it('renders the index page', async () => {
    console.log("test1 DDD")
    const page = await createPage('/')
    console.log("test1 EEE")
    const body = await page.innerHTML('body')
    console.log("test1 FFF")
    console.log(body)
    expect(body).toContain('__nuxt')
  })*/


  //if (isDev()) {
  //  it('[dev] ensure vite client script is added', async () => {
  //    expect(await $fetch('/')).toMatch('/_nuxt/@vite/client"')
  //  })
  //}
})
