/**
 * @description: misc utils functions are defined here
 */

function randomFourDigitNumber() {
  return Math.random().toString(36).substring(2, 6);
}

function eventCodeGenerator(): number {
  return parseInt(Math.random().toString(36).substring(2, 8));
}
function slugify(name: string) {
  return (
    name.toLowerCase().split(" ").join("-") + "-" + randomFourDigitNumber()
  );
}

export { slugify, eventCodeGenerator };
