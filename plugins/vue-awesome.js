// Runs in client
// https://github.com/Justineo/vue-awesome
// https://fontawesome.com/icons?d=gallery&m=free

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";

import {
  faCheckCircle,
  faEdit,
  faEnvelope,
  faExternalLinkAlt,
  faHome,
  faInfoCircle,
  faMinusCircle,
  faPlusCircle,
  faPlusSquare,
  faQuestionCircle,
  faSignOutAlt,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import {} from "@fortawesome/free-brands-svg-icons";

library.add(
  faCheckCircle,
  faEdit,
  faEnvelope,
  faExternalLinkAlt,
  faHome,
  faInfoCircle,
  faMinusCircle,
  faPlusCircle,
  faPlusSquare,
  faQuestionCircle,
  faSignOutAlt,
  faTimesCircle
);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("VIcon", FontAwesomeIcon);
});
