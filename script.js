let current, currShowed;
worldMap.addEventListener("click", (e) => {
  if (e.target.tagName === "path") {
    showFace(e.target.getAttribute("id"), e.target.getAttribute("name"));
  }
});
worldMap.addEventListener("mousemove", (e) => {
  const { id, tagName } = e.target;
  if (current !== undefined) {
    current.classList.remove("current");
  }
  hoverCountryName.innerHTML = "";
  if (tagName === "path") {
    current = e.target;
    let { x, y } = getXY(e.clientX, e.clientY);
    hoverCountryName.setAttribute("x", x + 10);
    hoverCountryName.setAttribute("y", y - 10);
    hoverCountryName.innerHTML = current.getAttribute("name");
    current.classList.add("current");
  } else {
    current = undefined;
  }
});
countryImage.addEventListener("error", async () => {
  countryModal.close();
  const { called } = await (
    await fetch(
      `https://netsi-count.deno.dev?list=country&key=err_${currCountryCode}`
    )
  ).json();
  country.textContent = currCountry ?? "this area.";
  errorModal.showModal();
  requested.textContent = called;
  newPrompt.value = `It is a beautiful sunny day. The face of a smiling beautiful young 25 years pretty woman from ${currCountry} is standing very very close in front of me, in the background you see the beach`;
});

let currCountryCode, currCountry;
async function showFace(countryCode, country) {
  currShowed = 0;
  currCountryCode = countryCode;
  currCountry = country;
  const { called } = await (
    await fetch(
      `https://netsi-count.deno.dev?list=country&key=${currCountryCode}`
    )
  ).json();
  currShowed = called;
  const imageUrl = `https://raw.githubusercontent.com/netsi1964/fromCountries/main/${countryCode}/woman.jpg?${Math.random()}`;
  countryImage.src = imageUrl;

  countryName.textContent = `${country} (showed ${currShowed} times)`;

  countryModal.showModal();
  getStat();
}

closeModal.addEventListener("click", () => {
  countryModal.close();
});
closeErrorModal.addEventListener("click", () => {
  errorModal.close();
});
getStat();
async function getStat() {
  let stat = await (
    await fetch("https://netsi-count.deno.dev?list=country&viewAll")
  ).json();
  stat = Object.entries(stat)
    .filter((a) => a[0] !== "undefined" && a[0].indexOf("err_") === -1)
    .sort((a, b) =>
      a[1] > b[1] ? -1 : a[1] == b[1] ? a[0].localeCompare(b[0]) : 1
    );
  let top = "";
  for (var i = 0; i < Math.min(20, Object.keys(stat).length); i++) {
    const country =
      document.getElementById(stat[i][0])?.getAttribute("name") ?? "";
    if (country !== "") {
      stat[i][0] = country;
      top += `<li id="${country.replace(/ /gi, "-")}">${stat[i][0]} - ${
        stat[i][1]
      } click${stat[i][1] > 1 ? "s" : ""}</li>`;
    }
  }
  viewed.innerHTML = top;
}

let hovered;
viewed.addEventListener("click", (e) => {
  if (hovered) {
    let temp = e.target.id;
    // Create a new click event
    const clickEvent = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    // Dispatch the event
    hovered.dispatchEvent(clickEvent);
  }
});
viewed.addEventListener("mousemove", (e) => {
  if (hovered) {
    hovered.classList.remove("outline");
  }
  let temp = e.target.id;
  let country = temp.replace(/-/g, " ");
  hovered = document.querySelector(`[name="${country}"]`);
  hovered.classList.add("outline");
  const { clientX: _x1, clientY: _y1 } = e;
  const { x: x1, y: y1 } = getXY(_x1 + 4, _y1 - 2);
  const { x: _x, y: _y, width, height } = hovered.getBoundingClientRect();
  const { x: x, y: y } = getXY(_x + width / 2, _y + height / 2);
  let { height: h } = worldMap.getBoundingClientRect();
  viewedPath.setAttribute(
    "d",
    `M ${x} ${y} Q ${(x - x1) / 2} ${h - (y - y1) / 2} ${x1} ${y1}`
  );
});
viewed.addEventListener("mouseleave", (e) => {
  if (hovered) {
    hovered.classList.remove("outline");
    hovered = undefined;
    viewedPath.setAttribute("d", "");
  }
});

function getXY(clientX, clientY) {
  let point = worldMap.createSVGPoint();
  point.x = clientX; // 807
  point.y = clientY; // 235
  point = point.matrixTransform(worldMap.getScreenCTM().inverse());
  return { x: point.x, y: point.y };
}

setInterval(getStat, 2000);
