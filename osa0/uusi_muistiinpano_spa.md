```mermaid
sequenceDiagram
    participant browser
    participant server
    
	Note right of browser: browser appends note to local "notes" list and re-renders notes list
	
    browser->>server: POST https://studies.cs.helsinki.fi/exampleapp/new_note_spa
    activate server
    server-->>browser: 201 HTML created response
    deactivate server
```