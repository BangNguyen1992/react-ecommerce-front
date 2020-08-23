import React, { useState } from "react";
// import PropTypes from "prop-types";
import { Controller, useForm } from "react-hook-form";
import { gql, useMutation } from "@apollo/client";
import Router from "next/router";
import { Form, ErrorMessage } from "./styles/Form";
import formatMoney from "../lib/formatMoney";
import Error from "./ErrorMessage";
import { transformUrlString } from "../lib/utilities";

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
`;

// prettier-ignore
const uploadApi = "https://api.cloudinary.com/v1_1/bangnguyen-1992/image/upload";

const CreateItem = (props) => {
  const [loading, setLoading] = useState(false);
  const { register, control, handleSubmit, errors } = useForm();
  const [
    createItem,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(CREATE_ITEM_MUTATION);

  const onSubmit = async (data, event) => {
    setLoading(true);
    try {
      const imageData = new FormData();
      imageData.append("file", data.image[0]);
      imageData.append("upload_preset", "e-commerce");

      const res = await fetch(uploadApi, {
        method: "POST",
        body: imageData,
      });

      const uploadImageData = await res.json();

      const payload = {
        ...data,
        image: uploadImageData.eager[0]?.secure_url,
        largeImage: uploadImageData.secure_url,
      };

      const newItem = await createItem({ variables: { ...payload } });

      const { title, id } = newItem.data.createItem;
      event.target.reset();
      setLoading(false);

      Router.push({
        pathname: "/item",
        query: { name: transformUrlString(title), id },
      });
    } catch (e) {
      setLoading(false);
      console.error("Error CREATE_ITEM_MUTATION: ", e);
    }
  };

  // const handleUpload = async ({ target }) => {
  //   console.log("object target", target.files);
  //   const files = target.files;
  //   const data = new FormData();
  //   data.append("file", files[0]);
  //   data.append("upload_preset", "e-commerce");

  //   const res = await fetch(uploadApi, {
  //     method: "POST",
  //     body: data,
  //   });
  //   const file = await res.json();
  //   console.log("object file", file);
  // };

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
            ref={register({ required: "Title is required" })}
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
            rules={{ required: "Price is required" }}
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
            ref={register({ required: "Description is required" })}
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
            ref={register}
            // onChange={handleUpload}
            ref={register({ required: "Image is required" })}
          />
          {errors.image && <ErrorMessage>{errors.image.message}</ErrorMessage>}
        </label>

        <button type="submit">Submit</button>
      </fieldset>
      {mutationError && <Error error={mutationError} />}
    </Form>
  );
};

CreateItem.propTypes = {};

export default CreateItem;
