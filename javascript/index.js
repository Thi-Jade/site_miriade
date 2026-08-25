const wrapper = document.querySelector('.search-wrapper');
const toggle = document.querySelector('.search-toggle');

toggle.addEventListener('click', () => {
  wrapper.classList.toggle('active');
});

const arrow = document.querySelector(".scroll-arrow");

let t = 0;

function animate() {
  t += 0.07;

  const y = Math.sin(t) * 6;
  const opacity = 0.75 + Math.sin(t) * 0.15;

  arrow.style.transform = `translateY(${y}px)`;
  arrow.style.opacity = opacity;

  requestAnimationFrame(animate);
}

animate();

arrow.addEventListener("click", () => {
  const target = document.querySelector("#multirisque");

  target.scrollIntoView({
    behavior: "smooth"
  });
});

function openNav() {
  const panel = document.getElementById("mySidepanel");
  if (panel) panel.style.width = "320px";
}

function closeNav(){
  const sidepanel = document.getElementById("mySidepanel");
  if(sidepanel){
    sidepanel.style.width = "0";
  }

  document.querySelectorAll(".group").forEach(group => {
    group.classList.remove("open");
    const content = group.querySelector(".group-content");
    if(content){
      content.style.maxHeight = null;
    }
  });
}

document.querySelectorAll(".group-header").forEach(header => {
  header.addEventListener("click", () => {

    const group = header.parentElement;

    document.querySelectorAll(".group").forEach(otherGroup => {
      if (otherGroup !== group) {
        otherGroup.classList.remove("open");

        const content = otherGroup.querySelector(".group-content");
        if (content) {
          content.style.maxHeight = null;
        }
      }
    });

    group.classList.toggle("open");

    const content = group.querySelector(".group-content");

    if (group.classList.contains("open")) {
      content.style.maxHeight = content.scrollHeight + "px";
    } else {
      content.style.maxHeight = null;
    }

  });
});