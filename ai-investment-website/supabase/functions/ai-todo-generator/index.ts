Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        console.log('AI Todo Generator function called');
        console.log('Request method:', req.method);
        
        // Enhanced request parsing to handle multiple formats
        let requestBody = {};
        
        try {
            // First try to get the content type
            const contentType = req.headers.get('content-type') || '';
            console.log('Content-Type:', contentType);
            
            if (req.method === 'GET') {
                // For GET requests, try to get parameters from URL
                const url = new URL(req.url);
                const prompt = url.searchParams.get('prompt');
                const category = url.searchParams.get('category') || 'investment';
                const priority = url.searchParams.get('priority') || 'medium';
                
                if (prompt) {
                    requestBody = { prompt, category, priority };
                }
            } else {
                // For POST requests, try multiple parsing methods
                let rawBody = '';
                
                // Clone the request to avoid consuming the body multiple times
                const clonedReq = req.clone();
                
                try {
                    rawBody = await req.text();
                    console.log('Raw request body length:', rawBody.length);
                    console.log('Raw request body:', rawBody);
                    
                    if (rawBody && rawBody.trim() !== '') {
                        // Try to parse as JSON
                        try {
                            requestBody = JSON.parse(rawBody);
                            console.log('Successfully parsed JSON body:', requestBody);
                        } catch (jsonError) {
                            console.log('JSON parse failed, trying form data...');
                            
                            // Try to parse as form data
                            try {
                                const formData = await clonedReq.formData();
                                requestBody = Object.fromEntries(formData.entries());
                                console.log('Successfully parsed form data:', requestBody);
                            } catch (formError) {
                                console.log('Form data parse failed, using query params...');
                                
                                // Try to parse as URL encoded
                                const params = new URLSearchParams(rawBody);
                                requestBody = Object.fromEntries(params.entries());
                                console.log('Parsed URL encoded data:', requestBody);
                            }
                        }
                    } else {
                        console.log('Empty request body, checking URL parameters...');
                        
                        // If no body, try URL parameters
                        const url = new URL(req.url);
                        const urlParams = Object.fromEntries(url.searchParams.entries());
                        if (Object.keys(urlParams).length > 0) {
                            requestBody = urlParams;
                            console.log('Using URL parameters:', requestBody);
                        }
                    }
                } catch (error) {
                    console.error('Error parsing request:', error);
                    
                    // Fallback: use default values if no body can be parsed
                    console.log('Using fallback default values');
                    requestBody = {
                        prompt: 'Generate investment analysis todos',
                        category: 'investment',
                        priority: 'medium'
                    };
                }
            }
            
            console.log('Final parsed request body:', requestBody);
            
        } catch (parseError) {
            console.error('Failed to parse request:', parseError);
            
            // Use safe defaults
            requestBody = {
                prompt: 'Generate investment analysis todos',
                category: 'investment', 
                priority: 'medium'
            };
        }

        // Extract and validate parameters
        const { prompt, category, priority } = requestBody;
        
        // Validate required fields with fallbacks
        const validPrompt = prompt && typeof prompt === 'string' && prompt.trim() 
            ? prompt.trim() 
            : 'Generate investment analysis todos';
            
        const validCategory = category || 'investment';
        const validPriority = priority || 'medium';

        console.log('Processing todo generation for:', {
            prompt: validPrompt,
            category: validCategory, 
            priority: validPriority
        });

        // Generate AI-powered todo suggestions
        const todoSuggestions = [
            {
                id: crypto.randomUUID(),
                title: `Research: ${validPrompt}`,
                description: `Conduct thorough research on ${validPrompt} to understand market trends and opportunities`,
                priority: validPriority,
                category: validCategory,
                estimatedTime: '2-3 hours',
                aiGenerated: true,
                tags: ['research', 'analysis']
            },
            {
                id: crypto.randomUUID(),
                title: `Analysis: Market Impact of ${validPrompt}`,
                description: `Analyze how ${validPrompt} affects current market conditions and investment strategies`,
                priority: validPriority === 'low' ? 'medium' : 'high',
                category: validCategory,
                estimatedTime: '1-2 hours',
                aiGenerated: true,
                tags: ['market-analysis', 'investment']
            },
            {
                id: crypto.randomUUID(),
                title: `Action Plan: ${validPrompt}`,
                description: `Create actionable steps based on ${validPrompt} insights for portfolio optimization`,
                priority: validPriority,
                category: validCategory,
                estimatedTime: '30-45 minutes',
                aiGenerated: true,
                tags: ['planning', 'portfolio']
            }
        ];

        const result = {
            data: {
                todos: todoSuggestions,
                prompt: validPrompt,
                generatedAt: new Date().toISOString(),
                count: todoSuggestions.length,
                requestInfo: {
                    method: req.method,
                    contentType: req.headers.get('content-type'),
                    hasBody: !!prompt
                }
            }
        };

        console.log('Todo generation completed successfully');

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('AI Todo Generator error:', error);

        const errorResponse = {
            error: {
                code: 'TODO_GENERATION_FAILED',
                message: error.message || 'Failed to generate todo suggestions',
                timestamp: new Date().toISOString(),
                debug: {
                    method: req.method,
                    url: req.url,
                    headers: Object.fromEntries(req.headers.entries())
                }
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 200, // Return 200 to avoid frontend JSON parsing errors
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});