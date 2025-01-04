import i18n from '../../i18n/config';
import { gql, useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import { string, object, number } from 'yup';
import FormBody from '../form-elements/FormBody';
import Form from '../form-elements/Form';
import RatingField from '../form-elements/Rating';
import TextArea from '../form-elements/TextArea';
import Modal from '../Modal';

const rateOrderMutation = gql`
    mutation RateOrder($input: CreateReviewInput!) {
        createReview(input: $input) {
            id
            clientReview {
                foodWasGood
                deliveryOnTime
                orderWasCorrect
                comment
                createdAt
            }
            __typename
        }
    }
`;

const validSchema = object().shape({
    food: number().min(1).max(5).required(i18n.t("PleaseRateTheFood")),
    delivery: number().min(1).max(5).required(i18n.t("PleaseRateTheDelivery")),
    order: number().min(1).max(5).required(i18n.t("PleaseRateTheOrder")),
    comment: string().max(250)
});

export default function RateOrderForm(props) {
    const {
        open,
        close,
        order
    } = props;
    const formik = useFormik({
        initialValues: {
            food: 1,
            delivery: 1,
            order: 1,
            comment: ""
        },
        validationSchema: validSchema,
        onSubmit: values => {
            let args = {
                variables: {
                    input: {
                        rating: {
                            foodWasGood: values.food || 0,
                            deliveryOnTime: values.delivery || 0,
                            orderWasCorrect: values.order || 0
                        },
                        orderID: order.id
                    }
                }
            };

            if ("comment" in values) {
                args.variables.input.comment = values.comment;
            }

            rateOrder(args);
        },
    });
    const [rateOrder, rateOrderStatus] = useMutation(rateOrderMutation, { onCompleted: reviewSaved, onError: saveError });

    function saveError(error) {
        console.log(error);
        console.log("order_rating_save_error");
        formik.setSubmitting(false);
    }

    function reviewSaved(data) {
        close();
    }

    if (!order) {
        return null;
    }

    return (
        <Modal
            id="order-rate-modal"
            title={i18n.t("RateOrder")}
            open={open}
            onClose={close}
            actionBtnProps={{
                onClick: formik.handleSubmit,
                disabled: formik.isSubmitting || formik.isValidating,
            }}
        >
            <Form onSubmit={formik.handleSubmit}>
                <FormBody>
                    <RatingField
                        label={i18n.t("FoodWasGood")}
                        onSelect={index => {
                            formik.setFieldValue("food", index);
                            formik.setFieldTouched("food", true);
                        }}
                        {...formik.getFieldMeta("food")}
                    />

                    <RatingField
                        label={order.orderTypeID == "delivery" ? i18n.t("DeliveryWasOnTime") : i18n.t("OrderWasReadyOnTime")}
                        onSelect={index => {
                            formik.setFieldValue("delivery", index);
                            formik.setFieldTouched("delivery", true);
                        }}
                        {...formik.getFieldMeta("delivery")}
                    />

                    <RatingField
                        label={i18n.t("OrderWasCorrect")}
                        onSelect={index => {
                            formik.setFieldValue("order", index);
                            formik.setFieldTouched("order", true);
                        }}
                        {...formik.getFieldMeta("order")}
                    />

                    <TextArea
                        rows={4}
                        fullWidth
                        label={i18n.t("LeaveFeedback")}
                        name="comment"
                        {...formik.getFieldProps('comment')}
                        {...formik.getFieldMeta("comment")}
                    />
                </FormBody>
            </Form>
        </Modal>
    )
}