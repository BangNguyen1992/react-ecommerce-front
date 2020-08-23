import React, { useState } from 'react'
// import PropTypes from "prop-types";
import { Controller, useForm } from 'react-hook-form'
import { gql, useMutation } from '@apollo/client'
import Router from 'next/router'
import styled from 'styled-components'
// import axios from 'axios'
import { Form, ErrorMessage } from './styles/Form'
import formatMoney from '../lib/formatMoney'
import Error from './ErrorMessage'
import { transformUrlString } from '../lib/utilities'

export const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
      title
      description
      price
    }
  }
`

// prettier-ignore
const uploadApi = "https://api.cloudinary.com/v1_1/bangnguyen-1992/image/upload";
const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png']

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 24rem;
`

const CreateItem = (props) => {
  const [loading, setLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [imageError, setImageError] = useState(null)
  const { register, control, handleSubmit, errors } = useForm()
  // prettier-ignore
  const [createItem, { loading: mutationLoading, error: mutationError }] = useMutation(CREATE_ITEM_MUTATION);

  const handleClick = (e) => {
    setImageError(null)
    setPreviewImage(null)
  }

  const handlePreviewImage = async ({ target }) => {
    const file = target.files[0]
    if (file) {
      if (acceptedImageTypes.includes(file['type'])) {
        return setPreviewImage(URL.createObjectURL(file))
      }
      return setImageError('Only support image file')
    }
    // setImageError(null)
  }

  const uploadImage = async (image) => {
    if (!imageError) {
      const imageData = new FormData()
      imageData.append('file', image)
      imageData.append('upload_preset', 'e-commerce')

      return await fetch(uploadApi, {
        method: 'POST',
        body: imageData,
      })
        .then((res) => {
          if (res.status >= 400 && res.status < 600)
            return res.json().then((value) => {
              throw value.error.message
            })

          return res
        })
        .catch((error) => {
          setImageError(error.message || error)
          return error
        })
    }
    throw 'Only support image file'
  }

  const onSubmit = async (data, event) => {
    setLoading(true)
    try {
      const response = await uploadImage(data.image[0])
      const imageData = await response.json()

      const payload = {
        ...data,
        image: imageData.eager[0].secure_url,
        largeImage: imageData.secure_url,
      }

      const newItem = await createItem({ variables: { ...payload } })
      const { title, id } = newItem.data.createItem

      event.target.reset()
      setLoading(false)
      setPreviewImage(null)

      Router.push({
        pathname: '/item',
        query: { name: transformUrlString(title), id },
      })
    } catch (e) {
      setLoading(false)
      console.error('Error CREATE_ITEM_MUTATION: ', e)
    }
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={mutationLoading} aria-busy={loading}>
        <label htmlFor="title">
          Title
          <input
            id="title"
            name="title"
            type="text"
            defaultValue=""
            placeholder="Title"
            ref={register({ required: 'Title is required' })}
          />
          {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
        </label>

        <label htmlFor="price">
          Price
          <Controller
            render={({ onChange }) => (
              <input
                name="price"
                id="price"
                type="number"
                defaultValue=""
                placeholder="Price"
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
              />
            )}
            control={control}
            name="price"
            rules={{ required: 'Price is required' }}
          />
          {errors.price && <ErrorMessage>{errors.price.message}</ErrorMessage>}
        </label>

        <label htmlFor="description">
          Description
          <textarea
            id="description"
            name="description"
            defaultValue={null}
            placeholder="Description"
            ref={register({ required: 'Description is required' })}
          />
          {errors.description && (
            <ErrorMessage>{errors.description.message}</ErrorMessage>
          )}
        </label>

        <label htmlFor="image">
          Image
          <input
            id="image"
            name="image"
            type="file"
            placeholder="Upload an image"
            onChange={handlePreviewImage}
            onClick={handleClick}
            ref={register({ required: 'Image is required' })}
          />
          {previewImage && <PreviewImage src={previewImage} alt="image" />}
          {errors.image && <ErrorMessage>{errors.image.message}</ErrorMessage>}
          {imageError && <ErrorMessage>{imageError}</ErrorMessage>}
        </label>

        <button type="submit">Submit</button>
      </fieldset>
      {mutationError && <Error error={mutationError} />}
    </Form>
  )
}

CreateItem.propTypes = {}

export default CreateItem
