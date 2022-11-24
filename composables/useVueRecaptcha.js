/// DONE
import { VueReCaptcha, useReCaptcha } from 'vue-recaptcha-v3';
import { useNuxtApp } from '#app';

export const useVueRecaptcha = async () => {
  const { vueApp } = useNuxtApp();
  const runtimeConfig = useRuntimeConfig()
  const siteKey = runtimeConfig.public.RECAPTCHA_SITE_KEY;
  //console.log('useVueRecaptcha.js',siteKey)

  vueApp.use(VueReCaptcha, {
    siteKey: siteKey,
    loaderOptions: {
      autoHideBadge: false,
    },
  });
  const { executeRecaptcha, recaptchaLoaded } = useReCaptcha();
  await recaptchaLoaded();
  return await executeRecaptcha('login');
};
