// Tamino Martinius - All rights reserved

// Copyright © 2013 Tamino Martinius (http://zaku.eu)
// Copyright © 2013 Particleslider.com (http://particleslider.com

// Terms of usage: http://particleslider.com/legal/license

var init = function(){
    var isMobile = navigator.userAgent &&
      navigator.userAgent.toLowerCase().indexOf('mobile') >= 0;
    var isSmall = window.innerWidth < 1000;
    
    var ps = new ParticleSlider({
        ptlGap: isMobile || isSmall ? 3 : 0,
        ptlSize: isMobile || isSmall ? 3 : 1,
        width: window.innerWidth,
        height: window.innerHeight,
        mouseForce: 100,
        monochrome: true,
        color: '#000000'
    });
    
    // Store original particle positions
    ps.originalPositions = ps.ptls.map(ptl => ({x: ptl.x, y: ptl.y}));

    // Disperse particles initially
    disperseParticles(ps);

    // Add scroll event listener
    window.addEventListener('scroll', function() {
        var scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        updateParticlesPosition(ps, scrollProgress);
    });


    var gui = new dat.GUI();
    gui.add(ps, 'ptlGap').min(0).max(5).step(1).onChange(function(){
      ps.init(true);
    });
    gui.add(ps, 'ptlSize').min(1).max(5).step(1).onChange(function(){
      ps.init(true);
    });
    gui.add(ps, 'restless');
    gui.addColor(ps, 'color').onChange(function(value){
      ps.monochrome = true;
      ps.setColor(value);
        ps.init(true);  
    });
    
    
    (window.addEventListener
     ? window.addEventListener('click', function(){ps.init(true)}, false)
     : window.onclick = function(){ps.init(true)});
  }

  function disperseParticles(ps) {
    ps.ptls.forEach(ptl => {
        ptl.x = Math.random() * ps.cw;
        ptl.y = Math.random() * ps.ch;
    });
    ps.drawParticles();
}

function updateParticlesPosition(ps, progress) {
    ps.ptls.forEach((ptl, i) => {
        var originalPos = ps.originalPositions[i];
        ptl.x = ptl.x + (originalPos.x - ptl.x) * progress;
        ptl.y = ptl.y + (originalPos.y - ptl.y) * progress;
    });
    ps.drawParticles();
}
  
  var initParticleSlider = function(){
    var psScript = document.createElement('script');
    (psScript.addEventListener
      ? psScript.addEventListener('load', init, false)
      : psScript.onload = init);
    psScript.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/23500/ps-0.9.js';
      psScript.setAttribute('type', 'text/javascript');
    document.body.appendChild(psScript);
  }
      
  (window.addEventListener
    ? window.addEventListener('load', initParticleSlider, false)
    : window.onload = initParticleSlider);
  