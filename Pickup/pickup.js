const imageRows = document.querySelectorAll(
  ".imgBox1, .imgBox2, .imgBox3, .imgBox4"
);

const shuffle = (items) => {
  const shuffledItems = [...items];

  for (let i = shuffledItems.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffledItems[i], shuffledItems[randomIndex]] =
      [shuffledItems[randomIndex], shuffledItems[i]];
  }

  return shuffledItems;
};

const imageNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

imageRows.forEach((row) => {
  row.replaceChildren();

  shuffle(imageNumbers).forEach((imageNumber) => {
    const image = document.createElement("img");

    image.src = "../all/" + imageNumber + ".png";
    image.alt = imageNumber + "번 가챠 이미지";
    row.append(image);
  });
});