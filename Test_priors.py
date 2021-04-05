import os
import numpy as np
import matplotlib.pyplot as plt
from prior.inpaint import painter
from skimage import io, segmentation, color

src_dir = "../images/"
items = os.listdir(src_dir)

for i in range(0,int(len(items)/3)):
    img = io.imread(src_dir+"orig_"+str(i)+".png")
    mask = np.zeros((img.shape[0],img.shape[1]))
    mask_img = io.imread(src_dir+"mask_"+str(i)+".png")
    mask = mask + mask_img[:,:,3]
    mask = (mask>0).astype(np.float32)

    plt.imsave("mask.png",1-mask,cmap="gray")

    img_path  = src_dir+"orig_"+str(i)+".png"
    mask_path = 'mask.png'
    output_f = "F:/Projects/CMU/priors/"+str(i)+".png"

    painter(img_path,mask_path,num_iter=3001,out_name=output_f) 