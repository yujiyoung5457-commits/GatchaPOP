// 등장 애니메이션은 페이지를 새로 열 때마다 요소별로 한 번만 실행합니다.
const revealTargets = [
  document.querySelector(".txtBox1"),
  document.querySelector(".maintext1")
];
const revealedElements = new WeakSet();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting || revealedElements.has(entry.target)) return;

    revealedElements.add(entry.target);
    entry.target.classList.add("on");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.1 });

revealTargets.forEach((element) => {
  if (!element) return;
  observer.observe(element);
});

// 히어로 캡슐 3열 무한 자동 슬라이더
const ballTracks = document.querySelectorAll(".ball-track");
const ballImages = [
  "./all/ball01.png",
  "./all/ball02.png",
  "./all/ball03.png"
];

ballTracks.forEach((ballTrack) => {
  const ballSlideSet = ballTrack.querySelector(".ball-slide-set");
  if (!ballSlideSet) return;

  ballSlideSet.querySelectorAll("img").forEach((image) => {
    const randomIndex = Math.floor(Math.random() * ballImages.length);
    image.src = ballImages[randomIndex];
  });

  const lane = ballTrack.closest(".ball-lane");
  const laneIndex = [...document.querySelectorAll(".ball-lane")].indexOf(lane);
  const cloneCount = 1;

  for (let cloneIndex = 0; cloneIndex < cloneCount; cloneIndex += 1) {
    const clonedSet = ballSlideSet.cloneNode(true);
    clonedSet.setAttribute("aria-hidden", "true");
    ballTrack.append(clonedSet);
  }

  let ballAnimation;
  let previousCycleDistance = 0;

  const updateBallCycle = () => {
    const trackGap = parseFloat(getComputedStyle(ballTrack).gap) || 0;
    const cycleDistance = ballSlideSet.getBoundingClientRect().height + trackGap;
    if (cycleDistance <= 0) return;

    const requiredSetCount = Math.ceil(lane.clientHeight / cycleDistance) + 2;
    while (ballTrack.querySelectorAll(".ball-slide-set").length < requiredSetCount) {
      const extraSet = ballSlideSet.cloneNode(true);
      extraSet.setAttribute("aria-hidden", "true");
      ballTrack.append(extraSet);
    }

    if (Math.abs(cycleDistance - previousCycleDistance) < 0.5) return;

    previousCycleDistance = cycleDistance;
    ballAnimation?.cancel();

    const firstStep = cycleDistance / 3;
    const secondStep = cycleDistance * 2 / 3;
    ballAnimation = ballTrack.animate([
      { transform: "translateY(0)", offset: 0 },
      { transform: "translateY(0)", offset: .1 },
      { transform: `translateY(-${firstStep}px)`, offset: .28 },
      { transform: `translateY(-${firstStep}px)`, offset: .38 },
      { transform: `translateY(-${secondStep}px)`, offset: .56 },
      { transform: `translateY(-${secondStep}px)`, offset: .66 },
      { transform: `translateY(-${cycleDistance}px)`, offset: .84 },
      { transform: `translateY(-${cycleDistance}px)`, offset: 1 }
    ], {
      duration: 6000,
      iterations: Infinity,
      easing: "ease-in-out",
      direction: lane?.classList.contains("ball-lane-reverse") ? "reverse" : "normal",
      delay: laneIndex * -700
    });
  };

  updateBallCycle();
  window.addEventListener("load", updateBallCycle, { once: true });
  const ballResizeObserver = new ResizeObserver(updateBallCycle);
  ballResizeObserver.observe(ballSlideSet);
  ballResizeObserver.observe(lane);

});

// 캡슐에 마우스를 올리면 같은 번호의 호버 이미지를 표시합니다.
const ballHoverImages = {
  "ball01.png": "./all/ball01-01.png",
  "ball02.png": "./all/ball02-01.png",
  "ball03.png": "./all/ball03-01.png"
};

document.querySelectorAll(".imgBox").forEach((imgBox) => {
  const getBallTarget = (target) => {
    const link = target.closest(".ball-link");
    if (link && imgBox.contains(link)) return link.querySelector("img");

    const image = target.closest(".ball-slide-set > img");
    return image && imgBox.contains(image) ? image : null;
  };

  imgBox.addEventListener("click", (event) => {
    const image = getBallTarget(event.target);
    if (!image) return;

    // ball03은 기존에 로그인 링크였지만, 클릭 이미지 전환을 우선합니다.
    event.preventDefault();

    if (image.dataset.originalSrc) {
      image.src = image.dataset.originalSrc;
      delete image.dataset.originalSrc;
      return;
    }

    const originalSrc = image.getAttribute("src");
    const fileName = originalSrc.split("/").pop();
    const hoverSrc = ballHoverImages[fileName];
    if (!hoverSrc) return;

    image.dataset.originalSrc = originalSrc;
    image.src = hoverSrc;
  });
});

const slider = document.querySelector('.slider');
const prevButton = document.querySelector('.slider-prev');
const nextButton = document.querySelector('.slider-next');

const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const indexNavigation = document.querySelector('#index-navigation');

if (mobileMenuToggle && indexNavigation) {
  const closeMobileMenu = () => {
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenuToggle.setAttribute('aria-label', '메뉴 열기');
    indexNavigation.classList.remove('is-open');
  };

  mobileMenuToggle.addEventListener('click', () => {
    const willOpen = mobileMenuToggle.getAttribute('aria-expanded') !== 'true';
    mobileMenuToggle.setAttribute('aria-expanded', String(willOpen));
    mobileMenuToggle.setAttribute('aria-label', willOpen ? '메뉴 닫기' : '메뉴 열기');
    indexNavigation.classList.toggle('is-open', willOpen);
  });

  indexNavigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMobileMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMobileMenu();
  });
}

if (slider && prevButton && nextButton) {
  const originalCards = [...slider.querySelectorAll('.sns-card')];

  // 원본 카드 전체를 앞뒤에 복제해 어느 방향으로도 계속 이어지게 합니다.
  const beforeCards = originalCards.map((card) => card.cloneNode(true));
  const afterCards = originalCards.map((card) => card.cloneNode(true));

  [...beforeCards, ...afterCards].forEach((card) => {
    card.setAttribute('aria-hidden', 'true');
  });

  slider.prepend(...beforeCards);
  slider.append(...afterCards);

  const getMoveDistance = () => {
    const card = slider.querySelector('.sns-card');
    const gap = parseFloat(getComputedStyle(slider).gap) || 0;
    return card ? card.getBoundingClientRect().width + gap : slider.clientWidth;
  };

  const getCardPosition = (card) => {
    return card.getBoundingClientRect().left
      - slider.getBoundingClientRect().left
      + slider.scrollLeft;
  };

  const jumpTo = (left) => {
    slider.style.scrollBehavior = 'auto';
    slider.scrollLeft = left;
    requestAnimationFrame(() => {
      slider.style.scrollBehavior = '';
    });
  };

  const normalizePosition = () => {
    const realStart = getCardPosition(originalCards[0]);
    const nextSetStart = getCardPosition(afterCards[0]);
    const setWidth = nextSetStart - realStart;
    const edge = getMoveDistance() / 2;

    // 복제 카드까지 이동한 뒤 같은 모양의 원본 위치로 순간 이동합니다.
    // 화면에는 동일한 카드가 보여서 전환이 끊겨 보이지 않습니다.
    if (slider.scrollLeft >= nextSetStart - edge) {
      jumpTo(slider.scrollLeft - setWidth);
    } else if (slider.scrollLeft < realStart - edge) {
      jumpTo(slider.scrollLeft + setWidth);
    }
  };

  let scrollTimer;
  const handleScroll = () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(normalizePosition, 100);
  };

  prevButton.addEventListener('click', () => {
    slider.scrollBy({ left: -getMoveDistance(), behavior: 'smooth' });
  });

  nextButton.addEventListener('click', () => {
    slider.scrollBy({ left: getMoveDistance(), behavior: 'smooth' });
  });

  slider.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', normalizePosition);

  // 처음 열었을 때 가운데에 있는 실제 1번 카드부터 보여줍니다.
  requestAnimationFrame(() => jumpTo(getCardPosition(originalCards[0])));
}


// SNS 상품 카드 상세 모달
const productModal = document.querySelector(".product-modal");
const productModalClose = document.querySelector(".product-modal-close");
const productModalImage = document.querySelector(".product-modal-image");
const productModalTitle = document.querySelector("#product-modal-title");
const productModalBrand = document.querySelector(".product-modal-brand");
const productModalDescription = document.querySelector(".product-modal-description");

if (slider && productModal) {
  slider.querySelectorAll(".sns-card").forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    const label = card.querySelector("h2")?.textContent || "상품";
    card.setAttribute("aria-label", label + " 상세 보기");
  });

  const openProductModal = (card) => {
    const cardImage = card.querySelector(".sns-poster");
    const cardTitle = card.querySelector("h2");
    const cardBrand = card.querySelector("strong");
    const cardDescription = card.querySelector(".sns-content p");

    productModalImage.src = cardImage?.src || "";
    productModalImage.alt = cardImage?.alt || "가챠 상품 이미지";
    productModalTitle.textContent = cardTitle?.textContent || "가챠 시리즈";
    productModalBrand.textContent = "브랜드: " + (cardBrand?.textContent || "GATCHA POP");
    productModalDescription.textContent = cardDescription?.textContent || "";
    productModal.showModal();
  };

  slider.addEventListener("click", (event) => {
    const card = event.target.closest(".sns-card");
    if (card) openProductModal(card);
  });

  slider.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".sns-card");
    if (!card) return;
    event.preventDefault();
    openProductModal(card);
  });
}

productModalClose?.addEventListener("click", () => {
  productModal.close();
});

productModal?.addEventListener("click", (event) => {
  if (event.target === productModal) {
    productModal.close();
  }
});

// 검색 태그 입력칸 추가
const tagBox = document.querySelector(".btnBox");
const tagAddButton = document.querySelector(".btnBox .plus");

tagBox?.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".tag-remove");
  if (!removeButton) return;
  removeButton.closest(".tag-chip")?.remove();
});
tagAddButton?.addEventListener("click", () => {
  const tagInput = document.createElement("input");
  tagInput.type = "text";
  tagInput.className = "tag-input";
  tagInput.placeholder = "태그 입력";
  tagInput.setAttribute("aria-label", "새 검색 태그");
  tagBox.insertBefore(tagInput, tagAddButton);
  tagInput.focus();
});
// section6 number image switcher
const newItemImage = document.querySelector('.new-item-card > img');
const itemPageButtons = [...document.querySelectorAll('.item-pages button')];
const newItemImages = [
  './all/11.png',
  './all/1.png',
  './all/2.png',
  './all/3.png',
  './all/4.png',
  './all/5.png'
];

if (newItemImage && itemPageButtons.length) {
  itemPageButtons.forEach((button, index) => {
    button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');

    button.addEventListener('click', () => {
      const nextImage = newItemImages[index];
      if (!nextImage) return;

      newItemImage.src = nextImage;
      newItemImage.alt = `${index + 1}번 신상 가챠 상품`;

      itemPageButtons.forEach((pageButton) => {
        const isSelected = pageButton === button;
        pageButton.classList.toggle('active', isSelected);
        pageButton.setAttribute('aria-pressed', String(isSelected));
      });
    });
  });
}
// section4 매장 사진 클립 슬라이드: 다음 사진이 기존 사진 위로 펼쳐집니다.
const shopSlideBox = document.querySelector('.imgBox4');
const shopSlideImages = [
  './all/shop01.png',
  './all/shop02.png',
  './all/shop03.png'
];

if (shopSlideBox) {
  let shopCurrentImage = shopSlideBox.querySelector('img');
  let shopSlideIndex = 0;
  let shopIsChanging = false;
  const shopRevealDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900;

  // 이미지 교체 순간의 깜빡임을 막기 위해 미리 불러옵니다.
  shopSlideImages.forEach((source) => {
    const preloadImage = new Image();
    preloadImage.src = source;
  });

  setInterval(() => {
    if (shopIsChanging) return;
    shopIsChanging = true;

    const nextIndex = (shopSlideIndex + 1) % shopSlideImages.length;
    const nextImage = new Image();
    nextImage.src = shopSlideImages[nextIndex];
    nextImage.alt = `가챠 매장 내부 전경 ${nextIndex + 1}`;
    nextImage.className = 'shop-slide-next';

    const revealNextImage = () => {
      shopSlideBox.append(nextImage);

      // 브라우저가 시작 상태를 먼저 그린 뒤 펼침 클래스를 적용합니다.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => nextImage.classList.add('is-visible'));
      });

      setTimeout(() => {
        shopCurrentImage.remove();
        nextImage.classList.remove('shop-slide-next', 'is-visible');
        shopCurrentImage = nextImage;
        shopSlideIndex = nextIndex;
        shopIsChanging = false;
      }, shopRevealDuration + 50);
    };

    if (nextImage.complete) {
      revealNextImage();
    } else {
      nextImage.addEventListener('load', revealNextImage, { once: true });
      nextImage.addEventListener('error', () => { shopIsChanging = false; }, { once: true });
    }
  }, 4500); // 사진 한 장이 머무는 시간
}
