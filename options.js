for (const element of document.querySelectorAll('[data-i18n]')) {
  element.insertAdjacentHTML('beforeend', _(element.dataset.i18n));
}

(async () => {
  const { blacklist, timestamp, sync } = await getLocalStorage({
    blacklist: '',
    timestamp: new Date(0).toISOString(),
    sync: false
  });

  const blacklistTextArea = $('blacklistTextArea');
  const importTextArea = $('importTextArea');

  blacklistTextArea.value = blacklist;
  $('syncCheckBox').checked = sync;

  $('importButton').addEventListener('click', () => {
    blacklistTextArea.value = unlines(
      lines(blacklistTextArea.value).concat(
        lines(importTextArea.value).filter(s => /^[^/*]+$/.test(s)).map(s => '*://*.' + s + '/*')
      )
    );
    blacklistTextArea.scrollTop = blacklistTextArea.scrollHeight;
    importTextArea.value = '';
  });

  $('permitButton').addEventListener('click', async () => {
    try {
      await getAuthToken({ interactive: true });
      $('permitStatus').textContent = _('permitted');
    } catch (e) {
      $('permitStatus').textContent = _('notPermitted');
    }
  });

  $('okButton').addEventListener('click', async () => {
    await setLocalStorage({
      blacklist: blacklistTextArea.value,
      timestamp: blacklistTextArea.value != blacklist ? new Date().toISOString() : timestamp,
      sync: $('syncCheckBox').checked
    });
    chrome.runtime.sendMessage({});
    window.close();
  });
})();
