/*
 Copyright 2024 Jordan Carter
 */
document.addEventListener('DOMContentLoaded', () => {
  const boardPrefixInput = document.getElementById('boardPrefix');

  // Only allow uppercase letters in the board prefix field
  boardPrefixInput.addEventListener('input', () => {
    boardPrefixInput.value = boardPrefixInput.value.replace(/[^A-Z]/g, '');
  });

  // Load the saved settings
  chrome.storage.sync.get(['jiraUrl', 'newTab', 'boardPrefix'], (data) => {
    document.getElementById('jiraUrl').value = data.jiraUrl || '';
    document.getElementById('newTab').checked = data.newTab !== false;
    boardPrefixInput.value = data.boardPrefix || '';
  });

  // Save settings
  document.getElementById('save').addEventListener('click', () => {
    const jiraUrl = document.getElementById('jiraUrl').value;
    const newTab = document.getElementById('newTab').checked;
    const boardPrefix = boardPrefixInput.value;
    chrome.storage.sync.set({ jiraUrl, newTab, boardPrefix }, () => {
      console.log('Settings saved');
    });
  });
});
