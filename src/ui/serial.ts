import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import { SerialPort } from 'serialport';


let portSelector: HTMLSelectElement;
let refreshButton: HTMLButtonElement;
let connectButton: HTMLButtonElement;
// let baudRateSelector: HTMLSelectElement;
// let dataBitsSelector: HTMLSelectElement;
// let stopBitsSelector: HTMLSelectElement;
// let paritySelector: HTMLSelectElement;
// let flowControlCheckbox: HTMLInputElement;

let port: SerialPort | undefined;

export const term = new Terminal({
  scrollback: 10_000,
});
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);


/**
 * Download the terminal's contents to a file.
 */
function downloadTerminalContents(): void {
  if (!term) {
    throw new Error('no terminal instance found');
  }

  if (term.rows === 0) {
    console.log('No output yet');
    return;
  }

  term.selectAll();
  const contents = term.getSelection();
  term.clearSelection();
  const linkContent = URL.createObjectURL(
      new Blob([new TextEncoder().encode(contents).buffer],
          {type: 'text/plain'}));
  const fauxLink = document.createElement('a');
  fauxLink.download = `terminal_content_${new Date().getTime()}.csv`;
  fauxLink.href = linkContent;
  fauxLink.click();
}

/**
 * Clear the terminal's contents.
 */
function clearTerminalContents(): void {
  if (!term) {
    throw new Error('no terminal instance found');
  }

  if (term.rows === 0) {
    console.log('No output yet');
    return;
  }

  term.clear();
}

// /**
//  * @return {number} the currently selected baud rate
//  */
// function getSelectedBaudRate(): number {
//   return Number.parseInt(baudRateSelector.value);
// }

// /**
//  * @return {number} the currently selected data bit
//  */
// function getSelectedDataBits():  7 | 8 {
//   return Number.parseInt(dataBitsSelector.value) === 7? 7 : 8;
// }

// /**
//  * @return {number} the currently selected data bit
//  */
// function getSelectedStopBits(): 1 | 2 {
//   return Number.parseInt(stopBitsSelector.value) === 1? 1 : 2;
// }

/**
 * Resets the UI back to the disconnected state.
 */
function markDisconnected(): void {
  term.writeln('<DISCONNECTED>');
  portSelector.disabled = false;
  refreshButton.disabled = false;
  connectButton.textContent = '连接设备';
  connectButton.disabled = false;
  // baudRateSelector.disabled = false;
  // dataBitsSelector.disabled = false;
  // paritySelector.disabled = false;
  // stopBitsSelector.disabled = false;
  // flowControlCheckbox.disabled = false;
  port = undefined;
}

/**
 * Sets |port| to the currently selected port. If none is selected then the
 * user is prompted for one.
 */
function getSelectedPort(): void{
  if (portSelector.value == 'prompt') {
      console.log('No selected port!');
      alert('请选择一个端口!');
      port = undefined;
    } else {
      const selectedOption = portSelector.selectedOptions[0];
      port = new SerialPort({
          path: selectedOption.value,
          baudRate: 115200,
          dataBits: 8,
          stopBits: 1,
          autoOpen: false
      });
    }
}


/**
 * Initiates a connection to the selected port.
 */
function connectToPort(): void {
  getSelectedPort();
  if (port === undefined) {
    return;
  }

  portSelector.disabled = true;
  refreshButton.disabled = true;
  connectButton.textContent = 'Connecting...';
  connectButton.disabled = true;
  // baudRateSelector.disabled = true;
  // dataBitsSelector.disabled = true;
  // paritySelector.disabled = true;
  // stopBitsSelector.disabled = true;
  // flowControlCheckbox.disabled = true;


  port.open((err) => {
    if (err) {
      console.error(err);
      term.writeln(`<ERROR: ${err}>`);
      markDisconnected();
      return;
    }
    term.writeln('<CONNECTED>');
    connectButton.textContent = '断开连接';
    connectButton.disabled = false;
  })

  // Switches the port into "flowing mode"
  port.on('data', (data) => {
    term.write(data);
  })

  port.on('close', () => {
    markDisconnected();
  })
}

/**
 * Closes the currently active connection.
 */
function disconnectFromPort(): void {
  // Move |port| into a local variable so that connectToPort() doesn't try to
  // close it on exit.
  const localPort = port;
  port = undefined;

  if (localPort) {
    try {
      localPort.close();
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        term.writeln(`<ERROR: ${e.message}>`);
      }
    }
  }
}


function clearPortOption(): void {
  let count = portSelector.options.length - 1;
  while (count) {
      portSelector.options.remove(1);
      count--;
  }
}


function refreshCOMList() {
  if (!portSelector) {
    return;
  }
  clearPortOption();
  SerialPort.list().then((ports) => {
    ports.forEach((port) => {
      let path = port.path;
      const portOption = document.createElement('option');
      portOption.textContent = path;
      portOption.value = path;
      portSelector.appendChild(portOption);
    });
  }).catch((err) => {
    console.log(err);
  });
}


export function setupSerial(): void {
  const terminalElement = document.getElementById('terminal');

  if (terminalElement) {
    term.open(terminalElement);
    fitAddon.fit();

    window.addEventListener('resize', () => {
      fitAddon.fit();
    });
  }

  const downloadOutput =
    document.getElementById('download') as HTMLSelectElement;
  downloadOutput.addEventListener('click', downloadTerminalContents);

  const clearOutput = document.getElementById('clear') as HTMLSelectElement;
  clearOutput.addEventListener('click', clearTerminalContents);

  portSelector = document.getElementById('ports') as HTMLSelectElement;

  refreshButton = document.getElementById('refresh') as HTMLButtonElement;
  refreshButton.addEventListener('click', () => {
    refreshCOMList();
  })

  connectButton = document.getElementById('connect') as HTMLButtonElement;
  connectButton.addEventListener('click', () => {
    if (port) { // Fix
      disconnectFromPort();
    } else {
      connectToPort();
    }
  });

  // baudRateSelector = document.getElementById('baudrate') as HTMLSelectElement;
  // dataBitsSelector = document.getElementById('databits') as HTMLSelectElement;
  // paritySelector = document.getElementById('parity') as HTMLSelectElement;
  // stopBitsSelector = document.getElementById('stopbits') as HTMLSelectElement;
  // flowControlCheckbox = document.getElementById('rtscts') as HTMLInputElement;

}