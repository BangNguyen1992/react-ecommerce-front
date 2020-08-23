import React from "react";
import PropTypes from "prop-types";
// import gql from "graphql-tag";
import styled, { ThemeProvider, injectGlobal } from "styled-components";
// import { Query } from 'react-apollo'
import {gql,  useQuery } from "@apollo/client";
import Item from "./Item";
import { Center } from "./styles";

const StyledList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 6rem;
  max-width: ${(props) => props.theme.maxWidth};
  margin: 0 auto;
`;

const ItemsList = (props) => {
  const { loading, error, data } = useQuery(ALL_ITEMS_QUERY);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  return (
    <Center.CenterText>
      <p>HEllo Items</p>
      <StyledList>
        {data.items.map((item) => (
          <Item key={item.id} item={item} />
        ))}
      </StyledList>
    </Center.CenterText>
  );
};

ItemsList.propTypes = {};

export const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY {
    items {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`;

export default ItemsList;
