import * as xb from 'xrblocks';


export class VonageAudioCall extends xb.Script {
    constructor() {
        super();
        this.token = '';
        this.client = new vonageClientSDK.VonageClient();
        this.callId = null;
        // Keep a reference to the panel so we can destroy it later
        this.panel = null; 
        this.statusText = null;
        this.userName = "XR_User_1";
        this.serverURL = "https://orange-memory-pgwjpp4q426xvj-3000.app.github.dev"
    }

    init() {
        console.log("Vonage init!",this.client);
        this.setupVonageListeners();
        this.connectToVonage(this.userName);
    }

    async connectToVonage(name) {
        try {
            console.log(`Fetching token for ${name}...`);

            // 1. Fetch the token (AWAIT the result)
            const response = await fetch(`${this.serverURL}/token?name=${name}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.token = data.token;
            console.log("Fetched token successfully.");

            // 2. Create the Session (AWAIT the result)
            // Ensure you reference 'this.client', not 'client'
            const sessionId = await this.client.createSession(this.token);
            
            console.log("Session created successfully. Session ID:", sessionId);

            // 3. Update UI (Replace DOM code with XR Logic)
            // document.getElementById("login").style.display = "none"; <--- WON'T WORK IN XR
            
            // Instead, update your XR Panel text to show we are ready
            if(this.statusText) {
                this.statusText.text = "Connected. Waiting for calls...";
            // } else {
                // If no panel exists yet, maybe create a "Ready" panel
                // this.createStatusPanel("Connected as " + name); 
            }

        } catch (error) {
            console.error("Connection failed:", error);
            // Optional: Update XR text to show error
            if(this.statusText) this.statusText.text = "Connection Failed.";
        }
    }

    createCallPanel(callerName) {
        // SAFETY: If a panel already exists, don't create another one.
        if (this.panel) return;

        console.log("Creating Call UI...");
        
        // 1. Create the Panel
        this.panel = new xb.SpatialPanel({ backgroundColor: '#2b2b2baa' });
        this.add(this.panel);

        const grid = this.panel.addGrid();

        // 2. Status Text
        this.statusText = grid.addRow({ weight: 0.7 }).addText({
            text: `Incoming call from ${callerName}...`,
            fontColor: '#ffffff',
            fontSize: 0.08,
        });

        // 3. Controls
        const ctrlRow = grid.addRow({ weight: 0.3 });

        // Answer
        const yesButton = ctrlRow.addCol({ weight: 0.5 }).addIconButton({ text: 'call', fontSize: 0.5, color: '#00ff00' });
        yesButton.onTriggered = () => this._onAnswer();

        // Reject
        const noButton = ctrlRow.addCol({ weight: 0.5 }).addIconButton({ text: 'call_end', fontSize: 0.5, color: '#ff0000' });
        noButton.onTriggered = () => this._onHangup();

        // Orbiter
        const orbiter = grid.addOrbiter();
        orbiter.addExitButton();
        this.panel.updateLayouts();
    }

    destroyCallPanel() {
        if (this.panel) {
            console.log("Destroying Call UI...");
            // Assuming 'destroy()' is the method to remove an XR element. 
            // If strictly using three.js/xb logic, it might be: this.remove(this.panel);
            this.panel.destroy(); 
            this.panel = null;
            this.statusText = null;
        }
    }

    setupVonageListeners() {
        // --- 1. CREATE UI ON INVITE ---
        this.client.on('callInvite', (callId, from, channelType) => {
            this.callId = callId;
            console.log(`Incoming call from ${from}`);
            
            // Trigger the UI creation here
            this.createCallPanel(from);
        });

        this.client.on('legStatusUpdate', (callId, legId, status) => {
            if (this.statusText) {
                this.statusText.text = `Status: ${status}`;
            }
        });

        // --- 2. DESTROY UI ON CANCEL/HANGUP ---
        this.client.on('callInviteCancel', (callId) => {
            console.log(`Call cancelled: ${callId}`);
            this.callId = null;
            this.destroyCallPanel();
        });

        this.client.on("callHangup", (callId, callQuality, reason) => {
            console.log(`Call hung up: ${reason}`);
            this.callId = null;
            this.destroyCallPanel();
        });
    }

    _onAnswer() {
        console.log('Answering...');
        this.client.answer(this.callId)
        .then(() => {
          console.log("Success answering call.");
          this.statusText.text = `Call answered.`;
        })
        .catch(error => {
          console.error("Error answering call: ", error);
        });    
    }

    _onHangup() {
        console.log('Hanging up...');
        // this.client.hangup(this.callId);
        this.client.hangup(this.callId)
        .then(() => {
          console.log("Success hanging up call.");
        })
        .catch(error => {
          console.error("Error hanging up call: ", error);
        });           
        // We manually destroy the panel here too, just in case the event lags
        this.destroyCallPanel(); 
    }

}