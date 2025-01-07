# ocr-melody-generator

### Packages
**OMR:** numpy, tensorflow, python-opencv (not yet utilized)

**Music:** mido


### Current State (Jan. 6, 2025):
- Data set is currently very limited but will be increased continually
- Trained for classes: 1, 1h, 1u, 2, 3, 5, 5l, 5u, 6, 6lu, B, D, L
- melody_generator.py takes a string of class ID's and outputs corresponding MIDI file and plays melody
- melody generation and OMR functions have not yet been combined

### Training & Testing:
- to train, run ``` python train.py ```. Takes data from ``` data ``` file (not included)
- to test, run ``` python test.py ```. Tests data from ``` test ``` file (included)
- lower epochs with sufficient data set size

### Symbol Table
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
L - line (dash)\
