<template>
  <div class="col text-right reshow-help">
    NOT NOW USED
    <span class="info-icon-help">
      <a href='#' class="js-help-show"><i class="fas fa-question-circle"></i> Show help</a>
    </span>
  </div>
</template>
<script>
  export default {
    props: {
      error: {
        type: String
      },
      message: {
        type: String
      },
    },
  }
  $('.js-help-show').click(function () {
    $('.reshow-help').hide();
    $('.show-help').show();
    localStorage.removeItem('home-help');
  });
  $('.js-help-close').click(function () {
    $('.reshow-help').show();
    $('.show-help').hide();
    localStorage.setItem('home-help', '1');
  });
</script>
<style>
</style>
