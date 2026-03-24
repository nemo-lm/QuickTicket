/*
 Copyright 2024 Jordan Carter
 */
 const MAX_HISTORY = 5; // Maximum number of tickets to store

 document.addEventListener('DOMContentLoaded', () => {
   // Load and display the recently viewed tickets
   loadRecentlyViewed();

   const ticketInput = document.getElementById('ticketId');

   // Prefill with board prefix if set
   chrome.storage.sync.get('boardPrefix', (data) => {
     if (data.boardPrefix) {
       ticketInput.value = data.boardPrefix + '-';
     }
     ticketInput.focus();
   });

   ticketInput.addEventListener('keydown', (e) => {
     if (e.key === 'Enter') {
       goToTicket(ticketInput.value.trim());
     }
   });

   document.getElementById('goButton').addEventListener('click', () => {
     goToTicket(ticketInput.value.trim());
   });

   ticketInput.addEventListener('paste', (e) => {
     e.preventDefault();
     const pasted = (e.clipboardData || window.clipboardData).getData('text');
     const match = pasted.match(/[A-Z][A-Z0-9]+-\d+/);
     if (match) {
       ticketInput.value = match[0];
       goToTicket(match[0]);
     }
   });
 });

 function goToTicket(ticketId) {
   if (!ticketId || !/^[A-Za-z0-9-]+$/.test(ticketId)) {
     alert('Please enter a valid ticket ID.');
     return;
   }
   chrome.storage.sync.get(['jiraUrl', 'newTab', 'recentlyViewed'], (data) => {
     if (!data.jiraUrl) {
       alert('Please set the Jira URL in the extension options.');
       return;
     }
     const fullUrl = data.jiraUrl + ticketId;
     const openTicket = () => {
       if (data.newTab) {
         chrome.tabs.create({ url: fullUrl });
       } else {
         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
           chrome.tabs.update(tabs[0].id, { url: fullUrl });
         });
       }
     };

     // Update the recently viewed tickets
     const recentlyViewed = data.recentlyViewed || [];
     if (!recentlyViewed.includes(ticketId)) {
       if (recentlyViewed.length >= MAX_HISTORY) {
         recentlyViewed.pop(); // Remove the oldest ticket
       }
       recentlyViewed.unshift(ticketId); // Add the new ticket to the front
       chrome.storage.sync.set({ recentlyViewed }, openTicket);
     } else {
       openTicket();
     }
   });
 }

 function loadRecentlyViewed() {
   chrome.storage.sync.get('recentlyViewed', (data) => {
     const list = document.getElementById('recentlyViewed');
     list.innerHTML = ''; // Clear the current list
     (data.recentlyViewed || []).forEach((ticketId) => {
       const listItem = document.createElement('li');
       listItem.textContent = ticketId;
       listItem.addEventListener('click', () => {
         document.getElementById('ticketId').value = ticketId;
         goToTicket(ticketId);
       });
       list.appendChild(listItem);
     });
   });
 }
