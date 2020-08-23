import React from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { Title, ItemStyles, PriceTag } from "./styles";
import { transformUrlString } from "../lib/utilities";
import formatMoney from "../lib/formatMoney";

const Item = ({ item }) => {
  return (
    <ItemStyles>
      {item.image && <img src={item.image} alt={item.title} />}
      <Title>
        <Link
          href={{
            pathname: "/item",
            query: { name: transformUrlString(item.title), id: item.id },
          }}
        >
          <a>{item.title}</a>
        </Link>
      </Title>
      <PriceTag>{formatMoney(item.price)}</PriceTag>
      <p>{item.description}</p>

      <div className="buttonList">
        <Link
          href={{
            pathname: "/update",
            query: { name: transformUrlString(item.title), id: item.id },
          }}
        >
          <a>Edit</a>
        </Link>
        <button>Add to cart</button>
        <button>Delete</button>
      </div>
    </ItemStyles>
  );
};

Item.propTypes = {
  item: PropTypes.object.isRequired,
};

export default Item;
