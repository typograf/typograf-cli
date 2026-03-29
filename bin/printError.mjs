import pico from 'picocolors';

export default function printError(text) {
    console.error(pico.red(text));
}
