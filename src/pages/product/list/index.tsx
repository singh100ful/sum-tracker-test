import { FC, useEffect, useState } from "react";
import ResultString from "../../../components/content/result.content";
import Heading from "../../../components/heading/basic.heading";
import Pagination from "../../../components/pagination/basic.pagination";
import { PAGINATION_LIMIT } from "../../../constants/app.constants";
import { PaginateDataType, UrlType } from "../../../interface/common";
import { listContacts, listProducts } from "../../../services/products";
import { getQueryFromUrl, objectToUrl } from "../../../utils/common.utils";
import ProductsTable from "./components/products.table";
import { TypeAhead } from "../../../components/input/typeahead.input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "antd";

let fixedListParams = {
  paginate: true,
};

const ProductList: FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginateDataType>({
    next: null,
    prev: null,
    count: null,
    resultsCount: 0,
    offset: null,
    hasOffset: true,
    limit: PAGINATION_LIMIT,
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialValue = searchParams.get("contact");
  const initialOffset = searchParams.get("offset");
  const initialCount = searchParams.get("limit");

  const [selectedValue, setSelectedValue] = useState(
    initialValue ? initialValue : ""
  );

  useEffect(() => {
    if (selectedValue === "") {
      init();
      navigate("");
    } else {
      let query = {
        contact: selectedValue,
        limit: initialCount ? initialCount : PAGINATION_LIMIT,
        offset: initialOffset ? initialOffset : 0,
      };
      loadProducts(query);
      const url = objectToUrl({ ...query, ...fixedListParams });
      navigate(`?${url}`);
    }
  }, [selectedValue, navigate]);

  const init = async () => {
    loadProducts();
  };

  const loadProducts = async (queryParams?: Record<string, any>) => {
    let query = queryParams || {};

    setLoading(true);
    try {
      const res = await listProducts({
        query: { ...fixedListParams, ...query },
      });

      setProducts(res.data.results);
      setPagination((prev) => {
        return {
          ...prev,
          next: res.data.next,
          prev: res.data.previous,
          count: res.data.count,
          resultsCount: res.data.results.length,
          offset: query?.offset ? Number(query.offset) : null,
        };
      });
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleNext = (next: UrlType) => {
    if (next === null) {
      return;
    }
    let query = getQueryFromUrl(next);
    loadProducts(query);
    const url = objectToUrl({ ...query, ...fixedListParams });
    navigate(`?${url}`);
  };

  const handlePrev = (prev: UrlType) => {
    if (prev === null) {
      return;
    }
    let query = getQueryFromUrl(prev);
    loadProducts(query);
    const url = objectToUrl({ ...query, ...fixedListParams });
    navigate(`?${url}`);
  };

  const handleReset = () => {
    setSelectedValue("");
    navigate("");
  };

  return (
    <>
      <TypeAhead
        getSuggestions={listContacts}
        placeholder="Search here"
        onSelectValue={setSelectedValue}
      />
      <div style={{ marginBottom: "1rem" }}>
        <Heading titleLevel={2}>Products</Heading>
      </div>
      <div
        style={{
          backgroundColor: "white",
          padding: "0.5rem",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <Button onClick={handleReset}>Reset</Button>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <ResultString
                loading={loading}
                pagination={pagination}
                pageString={"product"}
              />
            </div>
            <div>
              <Pagination
                next={pagination.next}
                prev={pagination.prev}
                onNextClick={handleNext}
                onPrevClick={handlePrev}
              />
            </div>
          </div>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <ProductsTable list={products} loading={loading} />
        </div>
        <div>
          <Pagination
            next={pagination.next}
            prev={pagination.prev}
            onNextClick={handleNext}
            onPrevClick={handlePrev}
          />
        </div>
      </div>
    </>
  );
};

export default ProductList;
