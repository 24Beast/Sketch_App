# Importing Libraries
import os
import json
import flask
import base64
import numpy as np
from io import BytesIO
from flask_cors import CORS
import matplotlib.pyplot as plt
from prior.inpaint import painter
from skimage import io, segmentation, color
from flask import request, jsonify, Response, send_file

# App Initialization
app = flask.Flask(__name__)
app.config["DEBUG"] = True
CORS(app)

segments = None
orig = None
colours = [[255,0,0],[0,0,255],[0,255,0],[0,0,0],[255,255,255],[41,105,225]]
back_colour = [255,105,180,255]


# Routes
@app.route('/',methods=["GET"])
def home():
    fname = "./masks/"
    for file in os.listdir(fname):
        os.remove(fname+file)
    return "<h1>Prototype API</h1>"

@app.route("/slic",methods=["POST"])
def slic_segment():
    global segments,orig
    img_b64 = request.values['data'].split("base64,")[1]
    val = int(float(request.values['val']))
    image_result = open('orig.png', 'wb')
    image_result.write(base64.b64decode(img_b64))
    img = io.imread('orig.png')
    img = color.rgba2rgb(img)
    segments = segmentation.slic(img,n_segments=val,compactness=20,start_label=1)
    segmented_img = segmentation.mark_boundaries(img, segments)
    back_img = np.zeros((segmented_img.shape[0],segmented_img.shape[1],4))
    back_img[:,:,0] = img[:,:,0] * 255
    back_img[:,:,1] = img[:,:,1] * 255
    back_img[:,:,2] = img[:,:,2] * 255
    orig = img
    back_img[:,:,3] = 255
    plt.imsave("masks/back.png",back_img.astype(np.uint8))
    plt.imsave("segment.jpg",segmented_img)
    np.save("segments",segments)
    js = jsonify({"data":"abc"})
    print('Image received: {}'.format(img.shape))
    return js

@app.route("/felzen",methods=["POST"])
def felzen_segment():
    global segments,orig
    img_b64 = request.values['data'].split("base64,")[1]
    val = 600-int(float(request.values['val']))
    image_result = open('orig.png', 'wb')
    image_result.write(base64.b64decode(img_b64))
    img = io.imread('orig.png')
    img = color.rgba2rgb(img)
    segments = segmentation.felzenszwalb(img,min_size=val)
    segmented_img = segmentation.mark_boundaries(img, segments)
    back_img = np.zeros((segmented_img.shape[0],segmented_img.shape[1],4))
    back_img[:,:,0] = img[:,:,0] * 255
    back_img[:,:,1] = img[:,:,1] * 255
    back_img[:,:,2] = img[:,:,2] * 255
    back_img[:,:,3] = 255
    orig = img
    plt.imsave("masks/back.png",back_img.astype(np.uint8))
    plt.imsave("segment.jpg",segmented_img)
    np.save("segments",segments)
    print('Image received: {}'.format(img.shape))
    response = jsonify({'message': 'Happy Noises'})
    return response

@app.route("/select",methods=["POST"])
def selector():
    global segments
    global orig
    if(type(segments)==type(None)):
        segments = np.load("segments.npy")
    coords = request.values["data"]
    x,y,color_select = coords.split(",")
    x = int(float(x))
    y = int(float(y))
    color_select = int(float(color_select))
    colour = colours[color_select]
    mask_name = "masks/col_"+str(color_select)+".png"
    mark = segments[y,x]
    pre_mask = (1-(segments==mark)).astype(np.uint8)
    img = io.imread('segment.jpg')
    mask = np.zeros((pre_mask.shape[0],pre_mask.shape[1],3))
    mask[:,:,0] = pre_mask
    mask[:,:,1] = pre_mask
    mask[:,:,2] = pre_mask
    anti_mask = 1 - mask
    anti_mask[:,:,0] *= colour[0]
    anti_mask[:,:,1] *= colour[1]
    anti_mask[:,:,2] *= colour[2]
    img = img * mask + anti_mask
    trans_mask = (1 - pre_mask) * 255
    mask_img = None
    if(os.path.exists(mask_name)):
        print(mask_name)
        mask_img = plt.imread(mask_name)
        mask_img[:,:,3] *= 255 
    else:
        print("Mask Not Found")
        mask_img = np.zeros((pre_mask.shape[0],pre_mask.shape[1],4))
    if(type(orig)==type(None)):
        orig = plt.imread("orig.png")
    back_img = plt.imread("masks/back.png")
    mask_img[:,:,0] = orig[:,:,0] *255
    mask_img[:,:,1] = orig[:,:,1] *255
    mask_img[:,:,2] = orig[:,:,2] *255
    mask_img[:,:,3] = (mask_img[:,:,3] + trans_mask)%256
    back_img[:,:,0] = orig[:,:,0] *255
    back_img[:,:,1] = orig[:,:,1] *255
    back_img[:,:,2] = orig[:,:,2] *255
    back_img[:,:,3] = np.maximum((back_img[:,:,3]*255) - trans_mask,0)
    plt.imsave("segment.jpg",img.astype(np.uint8))
    plt.imsave("masks/back.png",back_img.astype(np.uint8))
    plt.imsave(mask_name,mask_img.astype(np.uint8))
    print('Image received: {}'.format(img.shape))
    response = jsonify({"Happy":"Noises"})
    return response

@app.route("/prior",methods=["POST"])
def prior():
    global orig
    if(type(orig)==type(None)):
        orig = plt.imread("orig.png")
    mask_names = request.values["data"]
    mask_names = mask_names.split(",")
    num_iter = int(float(request.values["Iter"]))
    print("Masks: {}".format(mask_names))
    mask = np.ones((orig.shape[0],orig.shape[1]))
    for mask_name in mask_names:
        mask_img = io.imread("masks/"+mask_name+".png")
        mask = mask * (1-mask_img[:,:,3])
    plt.imsave("mask.png",1-mask,cmap="gray")
    img_path  = 'orig.png'
    mask_path = 'mask.png'
    painter(img_path,mask_path,num_iter+1)
    print('Masks recieved: {}'.format(mask_names))
    response = jsonify({"Happy":"Noises"})
    return response

app.run()