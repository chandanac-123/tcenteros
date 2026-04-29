import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import backarrow from '@assets/navigate-icons/backarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import { useNavigate } from 'react-router-dom'
import {
  useCalculateGstQuery,
  useFinalizeOnboardCenterMutation
} from '@api-queries/center-admin/on-boarding/Query'
import { useOnboardingStore } from '@store/onboardingStore'
import { Input } from '@pages/components/ui/input'
import { useFormik } from 'formik'
import { invoiceValidationSchema } from '@utils/validations'
import { Spinner } from '@pages/components/ui/spinner'
import { useState } from 'react'
import { useCreatePaymentOrder, useVerifyPayment } from '@api-queries/common/razorPay/query'

const InvoiceSummary = () => {
  const navigate = useNavigate()
  const store = useOnboardingStore()
  const resetStore = useOnboardingStore(state => state.resetStore)
  const [success, setSuccess] = useState(false)
  const { data, isFetching } = useCalculateGstQuery(store?.onboardId)
  const { mutateAsync: finalize, isLoading } = useFinalizeOnboardCenterMutation(
    store?.onboardId
  )
  const { mutate: create_Order, isPending } = useCreatePaymentOrder();
  const { mutateAsync: verifyPayment } = useVerifyPayment();
  const phoneNumber = data?.center_phone;

  const initialValues = {
    address_line_1: '',
    address_line_2: '',
    gst_number: ''
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: invoiceValidationSchema,
    onSubmit: async values => {
      try {
        const response = await finalize(values);
        console.log("Response", response);

        const payment_id = response?.payment?.payment_order_id;

        if (!payment_id) {
          throw new Error("Payment ID not found from finalize response");
        }

        console.log("Payment ID:", payment_id);

        create_Order(payment_id, {
          onSuccess: (res) => {
            console.log("Order ID:", res);
            const orderData = res?.data;
            openRazorpay(orderData);
          },
          onError: (err) => {
            console.log(err);
          },
        });




        // setSuccess(true)
        // resetStore()
        // setTimeout(() => {
        //   navigate('/primary-login')
        // }, 1500)
      } catch (error) {
        console.log('error: ', error)
      }
    }
  });

  const openRazorpay = async (orderData) => {
    try {
      const options = {
        key: orderData.key_id, // from backend
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TcenterOS",
        description: "Center Subscription Payment",
        order_id: orderData.order_id,

        handler: async function (response) {
          console.log("Payment Success:", response);
          const result = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          setSuccess(true)
          resetStore();
          navigate('/primary-login')
          console.log("Verified Result:", result);
        },

        prefill: {
          contact: phoneNumber
        }
        // theme: {
        //   color: "#6D28D9",
        // },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.log("Error at opening razor Pay checkOut");
    }

  };

  const yearlyPrice = data?.total_amount
    ? (data.total_amount * 12).toFixed(2)
    : 0
  return (
    <SecondaryLayout>
      <OnboardHeader />
      <div className='px-4 sm:px-10 '>
        {success && (
          <p className='text-green-600 text-center mt-2'>
            Payment successful! Redirecting...
          </p>
        )}
        <div className='flex justify-center'>
          {isFetching ? (
            <Spinner />
          ) : (
            <div className='bg-white rounded-3xl shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] p-4 w-full max-w-lg  '>
              {/* Header */}
              <h2 className='text-xl font-semibold text-center mb-4'>
                Billing Summary
              </h2>

              {/* Center Details */}
              <section className='mb-6'>
                <h3 className='font-semibold mb-1'>Center Details</h3>

                <div className='space-y-1 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Center Name</span>
                    <span className='font-medium'>{data?.center_name}</span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Contact</span>
                    <span className='font-medium'>{data?.center_phone}</span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-gray-500'>City</span>
                    <span className='font-medium'>{data?.city}</span>
                  </div>
                </div>

                <form
                  id='invoice-details-form'
                  className='space-y-1 mt-2'
                  onSubmit={formik.handleSubmit}
                >
                  <Input
                    label='Address'
                    name='address_line_1'
                    value={formik.values.address_line_1}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.address_line_1 &&
                      formik.errors.address_line_1
                    }
                  />
                  <Input
                    label='Pincode'
                    name='address_line_2'
                    value={formik.values.address_line_2}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.address_line_2 &&
                      formik.errors.address_line_2
                    }
                  />
                  <Input
                    label={
                      <>
                        GST NO:{' '}
                        <span className='text-xs text-gray-400 font-normal'>
                          (optional)
                        </span>
                      </>
                    }
                    name='gst_number'
                    value={formik.values.gst_number}
                    onChange={e =>
                      formik.setFieldValue(
                        'gst_number',
                        e.target.value.toUpperCase()
                      )
                    }
                    error={
                      formik.touched.gst_number && formik.errors.gst_number
                    }
                  />
                </form>
              </section>

              {/* Package Details */}
              <section className='mb-2'>
                <h3 className='font-semibold mb-1'>Package Details</h3>

                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>
                    White-Label Offline + Live Classes package (1 year)
                  </span>
                  <span className='font-medium'>
                    {data?.total_base_price
                      ? `₹${data?.total_base_price.toFixed(2)}`
                      : '₹00.00'}
                  </span>
                </div>
              </section>

              {/* Bill Breakdown */}
              <section className='mb-6'>
                <h3 className='font-semibold mb-1'>Detailed Bill Breakdown</h3>

                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Base price (1 year)</span>
                    <span>
                      {data?.total_base_price
                        ? `₹${data?.total_base_price.toFixed(2)}`
                        : '₹00.00'}
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-gray-600'>
                      GST ({data?.tax?.tax_percentage}%)
                    </span>
                    <span>
                      {data?.total_tax
                        ? `₹${data?.total_tax.toFixed(2)}`
                        : '₹00.00'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Total */}
              <div className='flex justify-between items-end mb-2'>
                <div>
                  <p className='font-semibold'>Total Amount Payable</p>
                  <p className='text-xs text-gray-400'>
                    (Include all payable taxes)
                  </p>
                </div>
                <p className='text-2xl font-bold text-purple-600'>
                  {data?.total_amount
                    ? `₹${data?.total_amount.toFixed(2)}`
                    : '₹00.00'}
                </p>
              </div>

              {/* Actions */}
              <div className='flex justify-center gap-3 mt-4'>
                <Button
                  form='invoice-details-form'
                  type='submit'
                  variant='onboard_button_filled'
                  className='w-1/2'
                  size='sm'
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
        {/* Bottom Back Button */}
        {!success && !isFetching && (
          <div className='mt-6'>
            <Button
              variant='outline_secondary'
              size='sm'
              leftIcon={backarrow}
              onClick={() => navigate('/pricing-page')}
            >
              Back
            </Button>
          </div>
        )}
      </div>
    </SecondaryLayout>
  )
}

export default InvoiceSummary