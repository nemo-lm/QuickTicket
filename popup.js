/*
 Copyright 2024 Jordan Carter
 */
 const MAX_HISTORY = 5; // Maximum number of tickets to store

 document.addEventListener('DOMContentLoaded', () => {
   // Load and display the recently viewed tickets
   loadRecentlyViewed();

   document.getElementById('ticketId').addEventListener('keydown', (e) => {
     if (e.key === 'Enter') {
       document.getElementById('goButton').click();
     }
   });

   document.getElementById('goButton').addEventListener('click', () => {
     const ticketId = document.getElementById('ticketId').value.trim();
     if (ticketId && /^[A-Za-z0-9-]+$/.test(ticketId)) {
       chrome.storage.sync.get(['jiraUrl', 'newTab', 'recentlyViewed'], (data) => {
         if (data.jiraUrl) {
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
         } else {
           alert('Please set the Jira URL in the extension options.');
         }
       });
     } else {
       alert('Please enter a valid ticket ID.');
     }
   });
 });

 function loadRecentlyViewed() {
   chrome.storage.sync.get('recentlyViewed', (data) => {
     const list = document.getElementById('recentlyViewed');
     list.innerHTML = ''; // Clear the current list
     (data.recentlyViewed || []).forEach((ticketId) => {
       const listItem = document.createElement('li');
       listItem.textContent = ticketId;
       listItem.addEventListener('click', () => {
         document.getElementById('ticketId').value = ticketId;
         document.getElementById('goButton').click();
       });
       list.appendChild(listItem);
     });
   });
 }
