import numpy as np
import matplotlib.pyplot as plt
from prior.inpaint import painter
from skimage import io, segmentation, color

'''
masks = ["col_0","col_2"]

img = io.imread('orig.png')
mask = np.zeros((img.shape[0],img.shape[1]))

for mask_name in masks:
    mask_img = io.imread("masks/"+mask_name+".png")
    mask = mask + mask_img[:,:,3]

mask = (mask>0).astype(np.float32)

plt.imsave("mask.png",1-mask,cmap="gray")

img_path  = 'orig.png'
mask_path = 'mask.png'
'''

painter("F:/Projects/CMU/Sketch_App/prior/data/inpainting/vase.png","F:/Projects/CMU/Sketch_App/prior/data/inpainting/vase_mask.png",out_name="F:/Projects/CMU/Sketch_App/inpaint_1.png")