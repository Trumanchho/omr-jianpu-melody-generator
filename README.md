# ocr-melody-generator

### Current State (Feb. 6, 2025):
- Data set is currently very limited but will be increased continually (**3014** total images)
- Trained for classes: 1, 1h, 1hu, 1u, 2, 2h, 2hu, 2u, 3, 3h, 3hu, 3u, 3w, 4, 4h, 4hu, 4lu, 4u, 5, 5h, 5hu, 5l, 5lu, 5u, 6, 6l, 6lu, 6u, 7, 7l, 7lu, 7u, 7w, B, D, L, S
- Created React frontend to scan Jianpu sheets and generate melodies using latest model
- Flask for backend
- Improved segmentation results for connected underlines

### Running the Web App
**1. Start Flask server**
- In your terminal, navigate to the flask-server directory i.e., ```cd flask-server```
- (Optional) Create a virtual environment before installing dependencies 
- Run ```pip install -r requirements.txt``` to install dependencies
- Run ```python server.py``` to start flask server
- The server should be running on [localhost:5000](http://127.0.0.1:5000). However, if it is not, you will need to change the VITE_API_URL environment variable located in the .env file inside the omr-project directory. If you are currently inside flask-server, type ```cd ../omr-project```

**2. Start React App on Dev**
- Open a new terminal and navigate to the omr-project directory i.e., ```cd omr-project```
- Once inside omr-project, run ```npm install```
- Then, run ```npm run dev```
- The app should now be running on localhost:5173 (vite should serve on port 5173 by default)

### Training & Testing:
- To train, run ``` python train.py ```. Takes data from ``` data ``` file (not included)
- To test, run ``` python test.py ```. Tests data from ``` test ``` file (sample included)
- The current model is [jianpu.model.keras](jianpu.model.keras) 
- Lower epochs with sufficient data set size

### Example Symbol Table
|Class ID| 1  | 1h | 1u | 2  | 3  | 5  | 5l | 5u | 6  | 6lu| B  | D  | L  |
|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| Symbol |![1](images/1_0.PNG)|![1h](images/1h_0.PNG)|![1u](images/1u_0.PNG)|![2](images/2_0.PNG)|![3](images/3_0.PNG)|![5](images/5_0.PNG)|![5l](images/5l_0.PNG)|![5u](images/5u_0.PNG)|![6](images/6_0.PNG)|![6lu](images/6lu_0.PNG)|![B](images/B_0.PNG)|![D](images/D_0.PNG)|![L](images/L_0.PNG)|

**Semantics**:

l - lower octave\
h - higher octave\
u - underlined\
w - double underlined\
B - bar\
D - dot\
L - line (dash)
S - sharp
