$(document).ready(function() {
  // Navigation bar click handlers
  $('#nav-city-data').on('click', function() {
    $('#data-section').show();
    $('#visual-representation-section').hide();
    $('#ranking-section').hide();
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
  });

  $('#nav-visualize').on('click', function() {
    $('#data-section').hide();
    $('#visual-representation-section').show();
    $('#ranking-section').hide();
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
  });

  // Ranking
  $('#nav-rank').on('click', function() {
    $('#data-section').hide();
    $('#visual-representation-section').hide();
    $('#ranking-section').show();
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
  });

  // AQMonitor click handler for landing page
  $('.navbar-brand').on('click', function() {
    $('#data-section').show();
    $('#visual-representation-section').hide();
    $('.nav-link').removeClass('active');
    $('#nav-city-data').addClass('active');
  });
});

